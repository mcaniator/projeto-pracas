import { auth } from "@/lib/auth/auth";
import { getSessionUser } from "@/lib/auth/userUtil";
import { prisma } from "@/lib/prisma";
import {
  APIRequestData,
  APIResponseInfo,
} from "@/lib/types/backendCalls/APIResponse";
import { Prisma } from "@prisma/client";
import { checkIfLoggedInUserHasAnyPermission } from "@serverOnly/checkPermission";
import { z } from "zod";

import {
  formSubmissionDataSchema,
  getFormSubmissionUpdateTransactions,
} from "./formSubmission";

export const createTallyDataSchema = z.object({
  locationId: z.number().int().positive(),
  startDate: z.coerce.date(),
  tallyProtocolId: z.number().int().positive(),
});

export type CreateTallyData = z.infer<
  typeof createTallyDataSchema
>;

export type CreateTallyResponse = NonNullable<
  Awaited<ReturnType<typeof createTally>>["data"]
>;

export const createTally = async (
  request: APIRequestData<CreateTallyData>,
) => {
  const data = request.data!;
  const session = await auth();

  if (!session?.user?.id) {
    return {
      responseInfo: {
        statusCode: 401,
        message: "Não foi possível obter o usuário logado!",
      } as APIResponseInfo,
      data: null,
    };
  }

  try {
    const tallyProtocol = await prisma.tallyProtocol.findFirst({
      where: {
        id: data.tallyProtocolId,
        finalized: true,
        archived: false,
      },
      select: {
        id: true,
        formId: true,
      },
    });

    if (!tallyProtocol) {
      return {
        responseInfo: {
          statusCode: 404,
          message: "Protocolo de contagem finalizado não encontrado!",
        } as APIResponseInfo,
        data: null,
      };
    }

    const tally = await prisma.tally.create({
      data: {
        startDate: data.startDate,
        location: { connect: { id: data.locationId } },
        user: { connect: { id: session.user.id } },
        tallyProtocol: {
          connect: { id: tallyProtocol.id },
        },
        formSubmission:
          tallyProtocol.formId ?
            { create: { formId: tallyProtocol.formId } }
          : undefined,
      },
      select: { id: true },
    });

    return {
      responseInfo: {
        statusCode: 201,
        message: "Contagem criada com sucesso!",
      } as APIResponseInfo,
      data: { tallyId: tally.id },
    };
  } catch {
    return {
      responseInfo: {
        statusCode: 500,
        message: "Erro ao criar contagem!",
      } as APIResponseInfo,
      data: null,
    };
  }
};

export const deleteTallyDataSchema = z.object({
  tallyId: z.coerce.number().int().positive(),
});

export type DeleteTallyData = z.infer<
  typeof deleteTallyDataSchema
>;

export const deleteTally = async (
  request: APIRequestData<DeleteTallyData>,
) => {
  const { tallyId } = request.data!;

  try {
    const tally = await prisma.tally.findUnique({
      where: { id: tallyId },
      select: {
        userId: true,
        formSubmissionId: true,
      },
    });

    if (!tally) {
      return {
        responseInfo: {
          statusCode: 404,
          message: "Contagem não encontrada!",
        } as APIResponseInfo,
        data: null,
      };
    }

    const user = await getSessionUser();
    if (tally.userId !== user?.id) {
      try {
        await checkIfLoggedInUserHasAnyPermission({
          roles: ["TALLY_MANAGER"],
        });
      } catch {
        return {
          responseInfo: {
            statusCode: 401,
            message: "Sem permissão para excluir contagem!",
          } as APIResponseInfo,
          data: null,
        };
      }
    }

    await prisma.$transaction(async (tx) => {
      await tx.tally.delete({
        where: { id: tallyId },
      });

      if (tally.formSubmissionId) {
        await tx.formSubmission.delete({
          where: { id: tally.formSubmissionId },
        });
      }
    });

    return {
      responseInfo: {
        statusCode: 200,
        message: "Contagem excluída!",
      } as APIResponseInfo,
      data: null,
    };
  } catch {
    return {
      responseInfo: {
        statusCode: 500,
        message: "Erro ao excluir contagem!",
      } as APIResponseInfo,
      data: null,
    };
  }
};

const personObservationCharacteristicDataSchema = z.object({
  personCharacteristicId: z.number().int().positive(),
});

const personObservationDataSchema = z
  .object({
    quantity: z.number().int().positive(),
    characteristics: z.array(personObservationCharacteristicDataSchema).min(1),
  })
  .superRefine((observation, context) => {
    const characteristicIds = observation.characteristics.map(
      ({ personCharacteristicId }) => personCharacteristicId,
    );

    if (new Set(characteristicIds).size !== characteristicIds.length) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["characteristics"],
        message: "A observação possui características duplicadas.",
      });
    }
  });

export type SavePersonObservationsParams = {
  tx: Prisma.TransactionClient;
  tallyId: number;
  personObservations: z.infer<typeof personObservationDataSchema>[];
};

export const savePersonObservations = async ({
  tx,
  tallyId,
  personObservations,
}: SavePersonObservationsParams) => {
  await tx.$executeRaw(
    Prisma.sql`DELETE FROM "person_observation" WHERE "tally_id" = ${tallyId}`,
  );

  if (personObservations.length === 0) return;

  // Reserve the IDs first so both inserts can be built in memory without
  // depending on the row order returned by INSERT ... RETURNING.
  const generatedObservationIds = await tx.$queryRaw<
    { index: number; id: number }[]
  >(Prisma.sql`
    SELECT
      "generated"."index"::integer AS "index",
      nextval(pg_get_serial_sequence('person_observation', 'id'))::integer AS "id"
    FROM generate_series(1, ${personObservations.length}) AS "generated" ("index")
    ORDER BY "generated"."index"
  `);

  const observationIdsByIndex = new Map<number, number>();
  generatedObservationIds.forEach(({ index, id }) => {
    observationIdsByIndex.set(index - 1, id);
  });

  const observationValues: Prisma.Sql[] = [];
  const characteristicValues: Prisma.Sql[] = [];

  personObservations.forEach((observation, index) => {
    const observationId = observationIdsByIndex.get(index);
    if (!observationId) {
      throw new Error("Erro ao gerar identificador da observação");
    }

    observationValues.push(
      Prisma.sql`(${observationId}, ${tallyId}, ${observation.quantity})`,
    );

    observation.characteristics.forEach(({ personCharacteristicId }) => {
      characteristicValues.push(
        Prisma.sql`(${observationId}, ${personCharacteristicId})`,
      );
    });
  });

  await tx.$executeRaw(Prisma.sql`
    INSERT INTO "person_observation" (
      "id",
      "tally_id",
      "quantity"
    )
    VALUES ${Prisma.join(observationValues, ",")}
  `);

  await tx.$executeRaw(Prisma.sql`
    INSERT INTO "person_observation_characteristic" (
      "person_observation_id",
      "person_characteristic_id"
    )
    VALUES ${Prisma.join(characteristicValues, ",")}
  `);
};

export const tallySubmitDataSchema = z
  .object({
    tallyId: z.coerce.number().int().positive(),
    formSubmission: formSubmissionDataSchema.optional(),
    personObservations: z.array(personObservationDataSchema),
    startDate: z.coerce.date(),
    endDate: z.coerce.date().nullable(),
    isFinalized: z.boolean(),
  })
  .superRefine((data, context) => {
    const observationKeys = data.personObservations.map((observation) =>
      observation.characteristics
        .map(({ personCharacteristicId }) => personCharacteristicId)
        .sort((a, b) => a - b)
        .join(":"),
    );

    if (new Set(observationKeys).size !== observationKeys.length) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["personObservations"],
        message: "Existem observações com o mesmo conjunto de características.",
      });
    }
  });

export type TallySubmitData = z.infer<
  typeof tallySubmitDataSchema
>;

export type TallySubmitResponse = NonNullable<
  Awaited<ReturnType<typeof tallySubmit>>["data"]
>;

export const tallySubmit = async (
  request: APIRequestData<TallySubmitData>,
) => {
  const data = request.data;

  if (!data) {
    return {
      responseInfo: {
        statusCode: 400,
        message: "Dados inválidos!",
      } as APIResponseInfo,
      data: null,
    };
  }

  const {
    tallyId,
    formSubmission,
    personObservations,
    startDate,
    endDate,
    isFinalized,
  } = data;

  try {
    const user = await getSessionUser();
    if (!user) {
      return {
        responseInfo: {
          statusCode: 401,
          message: "Erro na autenticação!",
        } as APIResponseInfo,
        data: null,
      };
    }

    const tally = await prisma.tally.findUnique({
      where: { id: tallyId },
      select: {
        userId: true,
        formSubmissionId: true,
        tallyProtocol: {
          select: {
            tallyProtocolGroups: {
              select: {
                displayMode: true,
                personCharacteristicGroup: {
                  select: { isTagGroup: true },
                },
                characteristics: {
                  select: { personCharacteristicId: true },
                },
              },
            },
          },
        },
      },
    });

    if (!tally) {
      return {
        responseInfo: {
          statusCode: 404,
          message: "Contagem não encontrada!",
        } as APIResponseInfo,
        data: null,
      };
    }

    if (user.id !== tally.userId) {
      try {
        await checkIfLoggedInUserHasAnyPermission({
          roles: ["TALLY_MANAGER"],
        });
      } catch {
        return {
          responseInfo: {
            statusCode: 401,
            message: "Sem permissão para editar esta contagem!",
          } as APIResponseInfo,
          data: null,
        };
      }
    }

    if (isFinalized && !endDate) {
      return {
        responseInfo: {
          statusCode: 400,
          message: "Informe a data final para finalizar a contagem!",
        } as APIResponseInfo,
        data: null,
      };
    }

    if (Boolean(tally.formSubmissionId) !== Boolean(formSubmission)) {
      // If the tally has a form submission, the form submission must be submitted from the client.
      return {
        responseInfo: {
          statusCode: 400,
          message: "Os dados do formulário não correspondem à contagem!",
        } as APIResponseInfo,
        data: null,
      };
    }

    const templateGroups =
      tally.tallyProtocol.tallyProtocolGroups;
    const allowedCharacteristicIds = new Set(
      templateGroups.flatMap((group) =>
        group.characteristics.map(
          (characteristic) => characteristic.personCharacteristicId,
        ),
      ),
    );
    const hasInvalidCharacteristic = personObservations.some((observation) =>
      observation.characteristics.some(
        ({ personCharacteristicId }) =>
          !allowedCharacteristicIds.has(personCharacteristicId),
      ),
    );

    if (hasInvalidCharacteristic) {
      return {
        responseInfo: {
          statusCode: 400,
          message: "Uma ou mais características não pertencem ao protocolo!",
        } as APIResponseInfo,
        data: null,
      };
    }

    const groupsWithExactlyOneCharacteristic = templateGroups.filter(
      (group) =>
        group.displayMode === "COUNTERS" ||
        group.displayMode === "SCREEN_CONTEXT_SELECTOR" ||
        (group.displayMode === "COMMON" &&
          !group.personCharacteristicGroup.isTagGroup),
    );
    const hasInvalidGroupSelection = personObservations.some((observation) => {
      const observationCharacteristicIds = new Set(
        observation.characteristics.map(
          ({ personCharacteristicId }) => personCharacteristicId,
        ),
      );

      return groupsWithExactlyOneCharacteristic.some((group) => {
        const selectedFromGroup = group.characteristics.filter(
          ({ personCharacteristicId }) =>
            observationCharacteristicIds.has(personCharacteristicId),
        ).length;
        return selectedFromGroup !== 1;
      });
    });

    if (hasInvalidGroupSelection) {
      return {
        responseInfo: {
          statusCode: 400,
          message: "A combinação de características da observação é inválida!",
        } as APIResponseInfo,
        data: null,
      };
    }

    const updatedTally = await prisma.$transaction(async (tx) => {
      const updatedTally = await tx.tally.update({
        where: { id: tallyId },
        select: {
          updatedAt: true,
          isFinalized: true,
        },
        data: {
          startDate,
          endDate,
          isFinalized,
        },
      });

      await savePersonObservations({
        tx,
        tallyId,
        personObservations,
      });

      if (tally.formSubmissionId && formSubmission) {
        const formSubmissionTransactions =
          await getFormSubmissionUpdateTransactions({
            tx,
            formSubmissionId: tally.formSubmissionId,
            formSubmission,
          });

        for (const transaction of formSubmissionTransactions) {
          await transaction;
        }
      }

      return updatedTally;
    });

    return {
      responseInfo: {
        statusCode: 201,
        message: "Contagem salva!",
      } as APIResponseInfo,
      data: {
        savedAsFinalized: updatedTally.isFinalized,
        updatedAt: updatedTally.updatedAt,
      },
    };
  } catch (e) {
    return {
      responseInfo: {
        statusCode: 500,
        message: "Erro ao salvar contagem!",
      } as APIResponseInfo,
      data: null,
    };
  }
};

export const createTallyProtocolDataSchema = z.object({
  name: z.string().trim().min(1).max(255),
  cloneTallyProtocolId: z.number().int().positive().optional(),
});

export type CreateTallyProtocolData = z.infer<
  typeof createTallyProtocolDataSchema
>;

export const createTallyProtocol = async (
  request: APIRequestData<CreateTallyProtocolData>,
) => {
  const data = request.data!;

  try {
    if (data.cloneTallyProtocolId) {
      const sourceTemplate = await prisma.tallyProtocol.findUnique({
        where: { id: data.cloneTallyProtocolId },
        select: {
          formId: true,
          tallyProtocolGroups: {
            select: {
              personCharacteristicGroupId: true,
              position: true,
              displayMode: true,
              characteristics: {
                select: {
                  personCharacteristicId: true,
                  position: true,
                },
              },
            },
          },
        },
      });

      if (!sourceTemplate) {
        return {
          responseInfo: {
            statusCode: 404,
            message: "Protocolo de contagem não encontrado!",
          } as APIResponseInfo,
          data: null,
        };
      }

      await prisma.$transaction(async (tx) => {
        const tallyProtocol = await tx.tallyProtocol.create({
          data: {
            name: data.name,
            formId: sourceTemplate.formId,
          },
          select: { id: true },
        });

        const groupValues = sourceTemplate.tallyProtocolGroups.map(
          (group) =>
            Prisma.sql`(${tallyProtocol.id}, ${group.personCharacteristicGroupId}, ${group.position}, ${group.displayMode}::"tally_protocol_group_display_modes")`,
        );

        if (groupValues.length === 0) return;

        const createdGroups = await tx.$queryRaw<
          { id: number; person_characteristic_group_id: number }[]
        >(Prisma.sql`
          INSERT INTO "tally_protocol_group" (
            "tally_protocol_id",
            "person_characteristic_group_id",
            "position",
            "display_mode"
          )
          VALUES ${Prisma.join(groupValues, ",")}
          RETURNING "id", "person_characteristic_group_id"
        `);

        const createdGroupIds = new Map(
          createdGroups.map((group) => [
            group.person_characteristic_group_id,
            group.id,
          ]),
        );
        const characteristicValues = sourceTemplate.tallyProtocolGroups.flatMap(
          (group) => {
            const tallyProtocolGroupId = createdGroupIds.get(
              group.personCharacteristicGroupId,
            );
            if (!tallyProtocolGroupId) {
              throw new Error("Grupo do template clonado não encontrado");
            }

            return group.characteristics.map(
              (characteristic) =>
                Prisma.sql`(${tallyProtocolGroupId}, ${characteristic.personCharacteristicId}, ${characteristic.position})`,
            );
          },
        );

        if (characteristicValues.length > 0) {
          await tx.$executeRaw(Prisma.sql`
            INSERT INTO "tally_protocol_characteristic" (
              "tally_protocol_group_id",
              "person_characteristic_id",
              "position"
            )
            VALUES ${Prisma.join(characteristicValues, ",")}
          `);
        }
      });
    } else {
      await prisma.tallyProtocol.create({ data: { name: data.name } });
    }

    return {
      responseInfo: {
        statusCode: 200,
        message: "Protocolo de contagem criado com sucesso!",
      } as APIResponseInfo,
      data: null,
    };
  } catch {
    return {
      responseInfo: {
        statusCode: 500,
        message: "Erro ao criar protocolo de contagem!",
      } as APIResponseInfo,
      data: null,
    };
  }
};

const tallyProtocolCharacteristicDataSchema = z.object({
  personCharacteristicId: z.number().int().positive(),
  position: z.number().int().positive(),
});

const commonTallyProtocolGroupDataSchema = z.object({
  personCharacteristicGroupId: z.number().int().positive(),
  position: z.number().int().positive(),
  displayMode: z.literal("COMMON"),
  characteristics: z.array(tallyProtocolCharacteristicDataSchema),
});

const specialTallyProtocolGroupDataSchema = z.object({
  personCharacteristicGroupId: z.number().int().positive(),
  position: z.number().int().positive(),
  displayMode: z.enum(["COUNTERS", "SCREEN_CONTEXT_SELECTOR"]),
  characteristics: z.array(tallyProtocolCharacteristicDataSchema),
});

export const updateTallyProtocolDataSchema = z.object({
  tallyProtocolId: z.number().int().positive(),
  formId: z.number().int().positive().nullable(),
  name: z.string().trim().min(1).max(255),
  finalized: z.boolean(),
  groups: z
    .array(
      z.discriminatedUnion("displayMode", [
        commonTallyProtocolGroupDataSchema,
        specialTallyProtocolGroupDataSchema,
      ]),
    )
    .superRefine((groups, context) => {
      const groupIds = new Set<number>();

      groups.forEach((group, index) => {
        if (groupIds.has(group.personCharacteristicGroupId)) {
          context.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Um grupo não pode ser adicionado mais de uma vez.",
            path: [index, "personCharacteristicGroupId"],
          });
        }
        groupIds.add(group.personCharacteristicGroupId);

        const characteristicIds = new Set<number>();
        group.characteristics.forEach((characteristic, characteristicIndex) => {
          if (characteristicIds.has(characteristic.personCharacteristicId)) {
            context.addIssue({
              code: z.ZodIssueCode.custom,
              message:
                "Uma característica não pode ser adicionada mais de uma vez ao grupo.",
              path: [
                index,
                "characteristics",
                characteristicIndex,
                "personCharacteristicId",
              ],
            });
          }
          characteristicIds.add(characteristic.personCharacteristicId);
        });
      });
    }),
});

export type UpdateTallyProtocolData = z.infer<
  typeof updateTallyProtocolDataSchema
>;

export const updateTallyProtocol = async (
  request: APIRequestData<UpdateTallyProtocolData>,
) => {
  const data = request.data!;

  try {
    const currentTemplate = await prisma.tallyProtocol.findFirst({
      where: {
        id: data.tallyProtocolId,
        finalized: false,
      },
      select: {
        tallyProtocolGroups: {
          select: {
            id: true,
            personCharacteristicGroupId: true,
            position: true,
            displayMode: true,
            characteristics: {
              select: {
                id: true,
                personCharacteristicId: true,
                position: true,
              },
            },
          },
        },
      },
    });

    if (!currentTemplate) {
      return {
        responseInfo: {
          statusCode: 400,
          message:
            "O protocolo de contagem não foi encontrado ou já está finalizado.",
        } as APIResponseInfo,
        data: null,
      };
    }

    if (data.formId !== null) {
      const form = await prisma.form.findFirst({
        where: {
          id: data.formId,
          formUse: "TALLY_AND_BEHAVIORAL_MAP",
          finalized: true,
          archived: false,
        },
        select: { id: true },
      });

      if (!form) {
        return {
          responseInfo: {
            statusCode: 400,
            message:
              "O formulário selecionado não foi encontrado ou não está disponível para uso.",
          } as APIResponseInfo,
          data: null,
        };
      }
    }

    const currentGroupsByPersonCharacteristicGroupId = new Map(
      currentTemplate.tallyProtocolGroups.map((group) => [
        group.personCharacteristicGroupId,
        group,
      ]),
    );
    const requestedGroupsByPersonCharacteristicGroupId = new Map(
      data.groups.map((group) => [group.personCharacteristicGroupId, group]),
    );

    const groupsToDelete = currentTemplate.tallyProtocolGroups.filter(
      (group) =>
        !requestedGroupsByPersonCharacteristicGroupId.has(
          group.personCharacteristicGroupId,
        ),
    );
    const groupsToUpdate = data.groups.flatMap((group) => {
      const currentGroup = currentGroupsByPersonCharacteristicGroupId.get(
        group.personCharacteristicGroupId,
      );
      if (
        !currentGroup ||
        (currentGroup.position === group.position &&
          currentGroup.displayMode === group.displayMode)
      ) {
        return [];
      }

      return [
        {
          id: currentGroup.id,
          position: group.position,
          displayMode: group.displayMode,
        },
      ];
    });
    const groupsToInsert = data.groups.filter(
      (group) =>
        !currentGroupsByPersonCharacteristicGroupId.has(
          group.personCharacteristicGroupId,
        ),
    );

    const characteristicsToDelete = currentTemplate.tallyProtocolGroups.flatMap(
      (currentGroup) => {
        const requestedGroup = requestedGroupsByPersonCharacteristicGroupId.get(
          currentGroup.personCharacteristicGroupId,
        );

        if (!requestedGroup) return currentGroup.characteristics;

        const requestedCharacteristicIds = new Set(
          requestedGroup.characteristics.map(
            (characteristic) => characteristic.personCharacteristicId,
          ),
        );
        return currentGroup.characteristics.filter(
          (characteristic) =>
            !requestedCharacteristicIds.has(
              characteristic.personCharacteristicId,
            ),
        );
      },
    );
    const characteristicsToUpdate = data.groups.flatMap((group) => {
      const currentGroup = currentGroupsByPersonCharacteristicGroupId.get(
        group.personCharacteristicGroupId,
      );
      if (!currentGroup) return [];

      const currentCharacteristicsByPersonCharacteristicId = new Map(
        currentGroup.characteristics.map((characteristic) => [
          characteristic.personCharacteristicId,
          characteristic,
        ]),
      );

      return group.characteristics.flatMap((characteristic) => {
        const currentCharacteristic =
          currentCharacteristicsByPersonCharacteristicId.get(
            characteristic.personCharacteristicId,
          );
        if (
          !currentCharacteristic ||
          currentCharacteristic.position === characteristic.position
        ) {
          return [];
        }

        return [
          { id: currentCharacteristic.id, position: characteristic.position },
        ];
      });
    });

    let groupsDeleteQuery: Prisma.Sql | null = null;
    if (groupsToDelete.length > 0) {
      groupsDeleteQuery = Prisma.sql`
        DELETE FROM "tally_protocol_group"
        WHERE "id" IN (${Prisma.join(
          groupsToDelete.map((group) => Prisma.sql`${group.id}`),
          ",",
        )})
      `;
    }

    let groupsUpdateQuery: Prisma.Sql | null = null;
    if (groupsToUpdate.length > 0) {
      const values = groupsToUpdate.map(
        (group) =>
          Prisma.sql`(${group.id}, ${group.position}, ${group.displayMode})`,
      );
      groupsUpdateQuery = Prisma.sql`
        UPDATE "tally_protocol_group" AS ttg
        SET
          "position" = value."position",
          "display_mode" = value."display_mode"::"tally_protocol_group_display_modes"
        FROM (VALUES ${Prisma.join(values, ",")}) AS value(id, position, display_mode)
        WHERE ttg."id" = value.id
      `;
    }

    let characteristicsDeleteQuery: Prisma.Sql | null = null;
    if (characteristicsToDelete.length > 0) {
      characteristicsDeleteQuery = Prisma.sql`
        DELETE FROM "tally_protocol_characteristic"
        WHERE "id" IN (${Prisma.join(
          characteristicsToDelete.map(
            (characteristic) => Prisma.sql`${characteristic.id}`,
          ),
          ",",
        )})
      `;
    }

    let characteristicsUpdateQuery: Prisma.Sql | null = null;
    let characteristicsTemporaryPositionQuery: Prisma.Sql | null = null;
    if (characteristicsToUpdate.length > 0) {
      const values = characteristicsToUpdate.map(
        (characteristic) =>
          Prisma.sql`(${characteristic.id}, ${characteristic.position})`,
      );
      characteristicsTemporaryPositionQuery = Prisma.sql`
        UPDATE "tally_protocol_characteristic"
        SET "position" = -"id"
        WHERE "id" IN (${Prisma.join(
          characteristicsToUpdate.map(
            (characteristic) => Prisma.sql`${characteristic.id}`,
          ),
          ",",
        )})
      `;
      characteristicsUpdateQuery = Prisma.sql`
        UPDATE "tally_protocol_characteristic" AS ttc
        SET "position" = value."position"
        FROM (VALUES ${Prisma.join(values, ",")}) AS value(id, position)
        WHERE ttc."id" = value.id
      `;
    }

    await prisma.$transaction(async (tx) => {
      await tx.tallyProtocol.update({
        where: { id: data.tallyProtocolId },
        data: {
          name: data.name,
          finalized: data.finalized,
          formId: data.formId,
        },
      });

      if (characteristicsDeleteQuery) {
        await tx.$executeRaw(characteristicsDeleteQuery);
      }
      if (groupsDeleteQuery) {
        await tx.$executeRaw(groupsDeleteQuery);
      }
      if (groupsUpdateQuery) {
        await tx.$executeRaw(groupsUpdateQuery);
      }

      const insertedGroups =
        groupsToInsert.length > 0 ?
          await tx.$queryRaw<
            { id: number; person_characteristic_group_id: number }[]
          >(Prisma.sql`
          INSERT INTO "tally_protocol_group" (
            "tally_protocol_id",
            "person_characteristic_group_id",
            "position",
            "display_mode"
          )
          VALUES ${Prisma.join(
            groupsToInsert.map(
              (group) =>
                Prisma.sql`(${data.tallyProtocolId}, ${group.personCharacteristicGroupId}, ${group.position}, ${group.displayMode}::"tally_protocol_group_display_modes")`,
            ),
            ",",
          )}
          RETURNING "id", "person_characteristic_group_id"
        `)
        : [];

      const tallyProtocolGroupIdsByPersonCharacteristicGroupId = new Map(
        currentTemplate.tallyProtocolGroups
          .filter((group) => !groupsToDelete.includes(group))
          .map((group) => [group.personCharacteristicGroupId, group.id]),
      );
      insertedGroups.forEach((group) => {
        tallyProtocolGroupIdsByPersonCharacteristicGroupId.set(
          group.person_characteristic_group_id,
          group.id,
        );
      });

      const characteristicsToInsert = data.groups.flatMap((group) => {
        const currentGroup = currentGroupsByPersonCharacteristicGroupId.get(
          group.personCharacteristicGroupId,
        );
        const currentCharacteristicIds = new Set(
          currentGroup?.characteristics.map(
            (characteristic) => characteristic.personCharacteristicId,
          ) ?? [],
        );
        const tallyProtocolGroupId =
          tallyProtocolGroupIdsByPersonCharacteristicGroupId.get(
            group.personCharacteristicGroupId,
          );
        if (!tallyProtocolGroupId) {
          throw new Error("Grupo do protocolo de contagem não encontrado.");
        }

        return group.characteristics
          .filter(
            (characteristic) =>
              !currentCharacteristicIds.has(
                characteristic.personCharacteristicId,
              ),
          )
          .map((characteristic) => ({
            tallyProtocolGroupId,
            personCharacteristicId: characteristic.personCharacteristicId,
            position: characteristic.position,
          }));
      });

      if (characteristicsTemporaryPositionQuery) {
        await tx.$executeRaw(characteristicsTemporaryPositionQuery);
      }
      if (characteristicsUpdateQuery) {
        await tx.$executeRaw(characteristicsUpdateQuery);
      }
      if (characteristicsToInsert.length > 0) {
        await tx.$executeRaw(Prisma.sql`
          INSERT INTO "tally_protocol_characteristic" (
            "tally_protocol_group_id",
            "person_characteristic_id",
            "position"
          )
          VALUES ${Prisma.join(
            characteristicsToInsert.map(
              (characteristic) =>
                Prisma.sql`(${characteristic.tallyProtocolGroupId}, ${characteristic.personCharacteristicId}, ${characteristic.position})`,
            ),
            ",",
          )}
        `);
      }
    });

    return {
      responseInfo: {
        statusCode: 200,
        message: "Protocolo de contagem salvo com sucesso!",
      } as APIResponseInfo,
      data: null,
    };
  } catch (e) {
    return {
      responseInfo: {
        statusCode: 500,
        message: "Erro ao salvar protocolo de contagem!",
      } as APIResponseInfo,
      data: null,
    };
  }
};

export const updateTallyProtocolArchiveStatusDataSchema = z.object({
  tallyProtocolId: z.number().int().positive(),
  archived: z.boolean(),
});

export type UpdateTallyProtocolArchiveStatusData = z.infer<
  typeof updateTallyProtocolArchiveStatusDataSchema
>;

export const updateTallyProtocolArchiveStatus = async (
  request: APIRequestData<UpdateTallyProtocolArchiveStatusData>,
) => {
  const data = request.data!;

  try {
    const tallyProtocol = await prisma.tallyProtocol.findUnique({
      where: { id: data.tallyProtocolId },
      select: { name: true },
    });

    if (!tallyProtocol) {
      return {
        responseInfo: {
          statusCode: 404,
          message: "Protocolo de contagem não encontrado!",
        } as APIResponseInfo,
        data: null,
      };
    }

    if (!data.archived) {
      await prisma.tallyProtocol.update({
        where: { id: data.tallyProtocolId },
        data: { archived: false },
      });

      return {
        responseInfo: {
          statusCode: 200,
          message: "Protocolo de contagem restaurado com sucesso!",
        } as APIResponseInfo,
        data: null,
      };
    }

    const tallyCount = await prisma.tally.count({
      where: { tallyProtocolId: data.tallyProtocolId },
    });

    if (tallyCount > 0) {
      await prisma.tallyProtocol.update({
        where: { id: data.tallyProtocolId },
        data: { archived: true },
      });

      return {
        responseInfo: {
          statusCode: 200,
          message: `Protocolo de contagem "${tallyProtocol.name}" arquivado com sucesso!`,
        } as APIResponseInfo,
        data: null,
      };
    }

    await prisma.$transaction(async (tx) => {
      await tx.tallyProtocolCharacteristic.deleteMany({
        where: {
          tallyProtocolGroup: {
            tallyProtocolId: data.tallyProtocolId,
          },
        },
      });
      await tx.tallyProtocolGroup.deleteMany({
        where: { tallyProtocolId: data.tallyProtocolId },
      });
      await tx.tallyProtocol.delete({
        where: { id: data.tallyProtocolId },
      });
    });

    return {
      responseInfo: {
        statusCode: 200,
        message: `Protocolo de contagem "${tallyProtocol.name}" excluído com sucesso!`,
      } as APIResponseInfo,
      data: null,
    };
  } catch {
    return {
      responseInfo: {
        statusCode: 500,
        message: "Erro ao atualizar protocolo de contagem!",
      } as APIResponseInfo,
      data: null,
    };
  }
};
