import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";
import {
  APIRequestData,
  APIResponseInfo,
} from "@/lib/types/backendCalls/APIResponse";
import { Prisma } from "@prisma/client";
import { z } from "zod";

export const createModularTallyDataSchema = z.object({
  locationId: z.number().int().positive(),
  startDate: z.coerce.date(),
  modularTallyTemplateId: z.number().int().positive(),
});

export type CreateModularTallyData = z.infer<
  typeof createModularTallyDataSchema
>;

export type CreateModularTallyResponse = NonNullable<
  Awaited<ReturnType<typeof createModularTally>>["data"]
>;

export const createModularTally = async (
  request: APIRequestData<CreateModularTallyData>,
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
    const modularTallyTemplate = await prisma.modularTallyTemplate.findFirst({
      where: {
        id: data.modularTallyTemplateId,
        finalized: true,
        archived: false,
      },
      select: { id: true },
    });

    if (!modularTallyTemplate) {
      return {
        responseInfo: {
          statusCode: 404,
          message: "Protocolo de contagem finalizado não encontrado!",
        } as APIResponseInfo,
        data: null,
      };
    }

    const modularTally = await prisma.modularTally.create({
      data: {
        locationId: data.locationId,
        startDate: data.startDate,
        userId: session.user.id,
        modularTallyTemplateId: modularTallyTemplate.id,
      },
      select: { id: true },
    });

    return {
      responseInfo: {
        statusCode: 201,
        message: "Contagem criada com sucesso!",
      } as APIResponseInfo,
      data: { modularTallyId: modularTally.id },
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

export const createModularTallyTemplateDataSchema = z.object({
  name: z.string().trim().min(1).max(255),
  cloneModularTallyTemplateId: z.number().int().positive().optional(),
});

export type CreateModularTallyTemplateData = z.infer<
  typeof createModularTallyTemplateDataSchema
>;

export const createModularTallyTemplate = async (
  request: APIRequestData<CreateModularTallyTemplateData>,
) => {
  const data = request.data!;

  try {
    if (data.cloneModularTallyTemplateId) {
      const sourceTemplate = await prisma.modularTallyTemplate.findUnique({
        where: { id: data.cloneModularTallyTemplateId },
        select: {
          tallyTemplateGroups: {
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
        const modularTallyTemplate = await tx.modularTallyTemplate.create({
          data: { name: data.name },
          select: { id: true },
        });

        const groupValues = sourceTemplate.tallyTemplateGroups.map(
          (group) =>
            Prisma.sql`(${modularTallyTemplate.id}, ${group.personCharacteristicGroupId}, ${group.position}, ${group.displayMode}::"tally_template_group_display_modes")`,
        );

        if (groupValues.length === 0) return;

        const createdGroups = await tx.$queryRaw<
          { id: number; person_characteristic_group_id: number }[]
        >(Prisma.sql`
          INSERT INTO "tally_template_group" (
            "modular_tally_template_id",
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
        const characteristicValues = sourceTemplate.tallyTemplateGroups.flatMap(
          (group) => {
            const tallyTemplateGroupId = createdGroupIds.get(
              group.personCharacteristicGroupId,
            );
            if (!tallyTemplateGroupId) {
              throw new Error("Grupo do template clonado não encontrado");
            }

            return group.characteristics.map(
              (characteristic) =>
                Prisma.sql`(${tallyTemplateGroupId}, ${characteristic.personCharacteristicId}, ${characteristic.position})`,
            );
          },
        );

        if (characteristicValues.length > 0) {
          await tx.$executeRaw(Prisma.sql`
            INSERT INTO "tally_template_characteristic" (
              "tally_template_group_id",
              "person_characteristic_id",
              "position"
            )
            VALUES ${Prisma.join(characteristicValues, ",")}
          `);
        }
      });
    } else {
      await prisma.modularTallyTemplate.create({ data: { name: data.name } });
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

const tallyTemplateCharacteristicDataSchema = z.object({
  personCharacteristicId: z.number().int().positive(),
  position: z.number().int().positive(),
});

const commonTallyTemplateGroupDataSchema = z.object({
  personCharacteristicGroupId: z.number().int().positive(),
  position: z.number().int().positive(),
  displayMode: z.literal("COMMON"),
  characteristics: z.array(tallyTemplateCharacteristicDataSchema),
});

const specialTallyTemplateGroupDataSchema = z.object({
  personCharacteristicGroupId: z.number().int().positive(),
  position: z.null(),
  displayMode: z.enum(["COUNTERS", "SCREEN_CONTEXT_SELECTOR"]),
  characteristics: z.array(tallyTemplateCharacteristicDataSchema),
});

export const updateTallyTemplateDataSchema = z.object({
  modularTallyTemplateId: z.number().int().positive(),
  name: z.string().trim().min(1).max(255),
  finalized: z.boolean(),
  groups: z
    .array(
      z.discriminatedUnion("displayMode", [
        commonTallyTemplateGroupDataSchema,
        specialTallyTemplateGroupDataSchema,
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

export type UpdateTallyTemplateData = z.infer<
  typeof updateTallyTemplateDataSchema
>;

export const updateTallyTemplate = async (
  request: APIRequestData<UpdateTallyTemplateData>,
) => {
  const data = request.data!;

  try {
    const currentTemplate = await prisma.modularTallyTemplate.findFirst({
      where: {
        id: data.modularTallyTemplateId,
        finalized: false,
      },
      select: {
        tallyTemplateGroups: {
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

    const currentGroupsByPersonCharacteristicGroupId = new Map(
      currentTemplate.tallyTemplateGroups.map((group) => [
        group.personCharacteristicGroupId,
        group,
      ]),
    );
    const requestedGroupsByPersonCharacteristicGroupId = new Map(
      data.groups.map((group) => [group.personCharacteristicGroupId, group]),
    );

    const groupsToDelete = currentTemplate.tallyTemplateGroups.filter(
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

    const characteristicsToDelete = currentTemplate.tallyTemplateGroups.flatMap(
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
        DELETE FROM "tally_template_group"
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
        UPDATE "tally_template_group" AS ttg
        SET
          "position" = value."position",
          "display_mode" = value."display_mode"::"tally_template_group_display_modes"
        FROM (VALUES ${Prisma.join(values, ",")}) AS value(id, position, display_mode)
        WHERE ttg."id" = value.id
      `;
    }

    let characteristicsDeleteQuery: Prisma.Sql | null = null;
    if (characteristicsToDelete.length > 0) {
      characteristicsDeleteQuery = Prisma.sql`
        DELETE FROM "tally_template_characteristic"
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
        UPDATE "tally_template_characteristic"
        SET "position" = -"id"
        WHERE "id" IN (${Prisma.join(
          characteristicsToUpdate.map(
            (characteristic) => Prisma.sql`${characteristic.id}`,
          ),
          ",",
        )})
      `;
      characteristicsUpdateQuery = Prisma.sql`
        UPDATE "tally_template_characteristic" AS ttc
        SET "position" = value."position"
        FROM (VALUES ${Prisma.join(values, ",")}) AS value(id, position)
        WHERE ttc."id" = value.id
      `;
    }

    await prisma.$transaction(async (tx) => {
      await tx.modularTallyTemplate.update({
        where: { id: data.modularTallyTemplateId },
        data: { name: data.name, finalized: data.finalized },
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
          INSERT INTO "tally_template_group" (
            "modular_tally_template_id",
            "person_characteristic_group_id",
            "position",
            "display_mode"
          )
          VALUES ${Prisma.join(
            groupsToInsert.map(
              (group) =>
                Prisma.sql`(${data.modularTallyTemplateId}, ${group.personCharacteristicGroupId}, ${group.position}, ${group.displayMode}::"tally_template_group_display_modes")`,
            ),
            ",",
          )}
          RETURNING "id", "person_characteristic_group_id"
        `)
        : [];

      const tallyTemplateGroupIdsByPersonCharacteristicGroupId = new Map(
        currentTemplate.tallyTemplateGroups
          .filter((group) => !groupsToDelete.includes(group))
          .map((group) => [group.personCharacteristicGroupId, group.id]),
      );
      insertedGroups.forEach((group) => {
        tallyTemplateGroupIdsByPersonCharacteristicGroupId.set(
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
        const tallyTemplateGroupId =
          tallyTemplateGroupIdsByPersonCharacteristicGroupId.get(
            group.personCharacteristicGroupId,
          );
        if (!tallyTemplateGroupId) {
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
            tallyTemplateGroupId,
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
          INSERT INTO "tally_template_characteristic" (
            "tally_template_group_id",
            "person_characteristic_id",
            "position"
          )
          VALUES ${Prisma.join(
            characteristicsToInsert.map(
              (characteristic) =>
                Prisma.sql`(${characteristic.tallyTemplateGroupId}, ${characteristic.personCharacteristicId}, ${characteristic.position})`,
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

export const updateModularTallyTemplateArchiveStatusDataSchema = z.object({
  modularTallyTemplateId: z.number().int().positive(),
  archived: z.boolean(),
});

export type UpdateModularTallyTemplateArchiveStatusData = z.infer<
  typeof updateModularTallyTemplateArchiveStatusDataSchema
>;

export const updateModularTallyTemplateArchiveStatus = async (
  request: APIRequestData<UpdateModularTallyTemplateArchiveStatusData>,
) => {
  const data = request.data!;

  try {
    const modularTallyTemplate = await prisma.modularTallyTemplate.findUnique({
      where: { id: data.modularTallyTemplateId },
      select: { name: true },
    });

    if (!modularTallyTemplate) {
      return {
        responseInfo: {
          statusCode: 404,
          message: "Protocolo de contagem não encontrado!",
        } as APIResponseInfo,
        data: null,
      };
    }

    if (!data.archived) {
      await prisma.modularTallyTemplate.update({
        where: { id: data.modularTallyTemplateId },
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

    const modularTallyCount = await prisma.modularTally.count({
      where: { modularTallyTemplateId: data.modularTallyTemplateId },
    });

    if (modularTallyCount > 0) {
      await prisma.modularTallyTemplate.update({
        where: { id: data.modularTallyTemplateId },
        data: { archived: true },
      });

      return {
        responseInfo: {
          statusCode: 200,
          message: `Protocolo de contagem "${modularTallyTemplate.name}" arquivado com sucesso!`,
        } as APIResponseInfo,
        data: null,
      };
    }

    await prisma.$transaction(async (tx) => {
      await tx.tallyTemplateCharacteristic.deleteMany({
        where: {
          tallyTemplateGroup: {
            modularTallyTemplateId: data.modularTallyTemplateId,
          },
        },
      });
      await tx.tallyTemplateGroup.deleteMany({
        where: { modularTallyTemplateId: data.modularTallyTemplateId },
      });
      await tx.modularTallyTemplate.delete({
        where: { id: data.modularTallyTemplateId },
      });
    });

    return {
      responseInfo: {
        statusCode: 200,
        message: `Protocolo de contagem "${modularTallyTemplate.name}" excluído com sucesso!`,
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
