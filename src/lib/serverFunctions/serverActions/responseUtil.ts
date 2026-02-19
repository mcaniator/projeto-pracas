"use server";

import {
  FormValues,
  ResponseFormGeometry,
} from "@/app/admin/assessments/[selectedAssessmentId]/responseFormV2";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@auth/userUtil";
import { Prisma } from "@prisma/client";
import { DefaultArgs } from "@prisma/client/runtime/library";
import { checkIfLoggedInUserHasAnyPermission } from "@serverOnly/checkPermission";
import { Coordinate } from "ol/coordinate";

import { APIResponseInfo } from "../../types/backendCalls/APIResponse";

const _addResponsesV2 = async ({
  assessmentId,
  responses,
  geometries,
  finalizationDate,
}: {
  assessmentId: number;
  responses: FormValues;
  geometries: ResponseFormGeometry[];
  finalizationDate: Date | null;
}) => {
  try {
    await checkIfLoggedInUserHasAnyPermission({
      roles: ["ASSESSMENT_EDITOR", "ASSESSMENT_MANAGER"],
    });
  } catch (e) {
    return {
      responseInfo: {
        statusCode: 401,
        message: "Sem permissão para avaliar!",
      } as APIResponseInfo,
    };
  }

  try {
    const user = await getSessionUser();
    if (!user) {
      return {
        responseInfo: {
          statusCode: 404,
          message: "Erro na autenticação!",
        } as APIResponseInfo,
      };
    }
    const assessment = await prisma.assessment.findUnique({
      where: {
        id: assessmentId,
      },
      select: {
        userId: true,
      },
    });
    if (!assessment) {
      return {
        responseInfo: {
          statusCode: 404,
          message: "Avaliação não encontrada!",
        } as APIResponseInfo,
      };
    }
    if (user.id !== assessment?.userId) {
      try {
        await checkIfLoggedInUserHasAnyPermission({
          roles: ["ASSESSMENT_MANAGER"],
        });
      } catch (e) {
        return {
          responseInfo: {
            statusCode: 401,
            message: "Sem permissão para editar esta avaliação!",
          } as APIResponseInfo,
        };
      }
    }

    const questions = await prisma.question.findMany({
      where: {
        id: {
          in: Object.keys(responses).map((key) => Number(key)),
        },
      },
      select: {
        id: true,
        questionType: true,
      },
    });

    const writtenResponses: {
      questionId: number;
      value: string | number | null;
    }[] = [];
    const optionsResponses: { questionId: number; value: number[] }[] = [];
    questions.forEach((q) => {
      if (!Object.keys(responses).includes(String(q.id))) {
        throw new Error("Resposta não enviada para uma ou mais questões!");
      }
      const response = responses[q.id];
      if (q.questionType === "WRITTEN") {
        if (Array.isArray(response)) {
          throw new Error("Resposta em array enviada para questão escrita!");
        }
        writtenResponses.push({ questionId: q.id, value: response ?? null });
      } else {
        if (!Array.isArray(response)) {
          optionsResponses.push({
            questionId: q.id,
            value: response == null ? [] : [Number(response)],
          });
        } else {
          optionsResponses.push({ questionId: q.id, value: response });
        }
      }
    });

    const assessmentUpdate = prisma.assessment.update({
      where: {
        id: assessmentId,
      },
      data: {
        endDate: finalizationDate,
      },
    });

    const transactions: Array<
      | Prisma.PrismaPromise<number>
      | Prisma.Prisma__AssessmentClient<
          {
            id: number;
            startDate: Date;
            endDate: Date | null;
            userId: string;
            locationId: number;
            formId: number;
            createdAt: Date;
            updatedAt: Date;
          },
          never,
          DefaultArgs
        >
    > = [];

    transactions.push(assessmentUpdate);

    const writtenResponsesSQLValues = writtenResponses.map(
      (r) =>
        Prisma.sql`(${r.value}, ${user.id}, ${r.questionId}, ${assessmentId}, 'NOW()')`,
    );
    if (writtenResponsesSQLValues.length > 0) {
      const writtenResponsesQuery = Prisma.sql`INSERT INTO "response" ("response", "user_id", "question_id", "assessment_id", "updated_at")
    VALUES ${Prisma.join(writtenResponsesSQLValues, `,`)}
    ON CONFLICT ("assessment_id", "question_id")
    DO UPDATE SET "response" = EXCLUDED."response"`;

      transactions.push(prisma.$executeRaw(writtenResponsesQuery));
    }

    const existingOptions = await prisma.responseOption.findMany({
      where: { assessmentId },
      orderBy: { createdAt: "asc" },
    });

    // group responseOption by questionId
    const responseOptionsByQuestion = existingOptions.reduce<
      Record<number, typeof existingOptions>
    >((acc, r) => {
      (acc[r.questionId] ||= []).push(r);
      return acc;
    }, {});

    const responseOptionIds: number[] = [];
    const caseStatements: Prisma.Sql[] = [];

    for (const { questionId, value } of optionsResponses) {
      const opts = value;

      //Creating CASE conditionals
      //Each responseOption related to the assessment will be modified
      //If there are more responseOption than options selected, the remaing responseOptions will have NULL atributed to optionId
      const responseOptions = responseOptionsByQuestion[questionId] || [];
      for (let i = 0; i < responseOptions.length; i++) {
        const option = responseOptions[i];
        if (!option) continue;
        const id = option.id;
        const newOpt = i < opts.length ? opts[i] : null;
        responseOptionIds.push(id);
        caseStatements.push(Prisma.sql`WHEN id = ${id} THEN ${newOpt}`);
      }
    }

    if (responseOptionIds.length > 0 && caseStatements.length > 0) {
      const responseOptionUpdate = Prisma.sql`
    UPDATE response_option
    SET option_id = CASE
      ${Prisma.join(caseStatements, "\n")}
      ELSE option_id
    END
    WHERE id IN (${Prisma.join(responseOptionIds)});
  `;

      transactions.push(prisma.$executeRaw(responseOptionUpdate));
    }

    //For each question, in case more options were sent than the current number of reponseOption, an INSERT will be made
    const insertValues: Prisma.Sql[] = [];
    for (const { questionId, value } of optionsResponses) {
      const opts = value;
      const existingResponseOptionCount = (
        responseOptionsByQuestion[questionId] || []
      ).length;

      for (let i = existingResponseOptionCount; i < opts.length; i++) {
        const option = opts[i];
        if (!option) continue;
        insertValues.push(
          Prisma.sql`(${user.id}, ${assessmentId}, ${questionId}, ${option}, NOW())`,
        );
      }
    }
    if (insertValues.length > 0) {
      const responseOptionInsert = Prisma.sql`INSERT INTO "response_option" ("user_id", "assessment_id", "question_id", "option_id", "updated_at")
      VALUES ${Prisma.join(insertValues, ",")}`;
      transactions.push(prisma.$executeRaw(responseOptionInsert));
    }

    //GEOMETRIES
    const geometryValues = geometries.map((geometryByQuestion) => {
      const { questionId, geometries } = geometryByQuestion;
      const wktGeometries = geometries
        .map((geometry) => {
          const { type, coordinates } = geometry;
          if (type === "Point") {
            const [longitude, latitude] = coordinates as number[];
            return `POINT(${longitude} ${latitude})`;
          } else if (type === "Polygon") {
            const polygonCoordinates = (coordinates as Coordinate[][])
              .map((ring) =>
                ring
                  .map(([longitude, latitude]) => `${longitude} ${latitude}`)
                  .join(", "),
              )
              .join("), (");

            return `POLYGON((${polygonCoordinates}))`;
          }
        })
        .join(", ");
      const geoText =
        wktGeometries.length > 0 ?
          Prisma.sql`ST_GeomFromText(${`GEOMETRYCOLLECTION(${wktGeometries})`}, 4326)`
        : Prisma.sql`NULL`;
      return Prisma.sql`(${assessmentId}, ${questionId}, ${geoText})`;
    });
    if (geometryValues.length > 0) {
      const geometryQuery = Prisma.sql`
      INSERT INTO question_geometry (assessment_id, question_id, geometry)
      VALUES ${Prisma.join(geometryValues, ",")}
      ON CONFLICT (assessment_id, question_id)
      DO UPDATE SET geometry = EXCLUDED.geometry
    `;

      transactions.push(prisma.$executeRaw(geometryQuery));
    }
    await prisma.$transaction(transactions);
    await prisma.assessment.findUnique({
      where: { id: assessmentId },
      select: {
        endDate: true,
      },
    });
    return {
      responseInfo: {
        statusCode: 201,
        message: "Avaliação salva!",
        showSuccessCard: true,
      } as APIResponseInfo,
      data: {
        savedAsFinalized: finalizationDate !== null,
      },
    };
  } catch (e) {
    return {
      responseInfo: {
        statusCode: 500,
        message: "Erro ao salvar avaliação!",
      } as APIResponseInfo,
    };
  }
};

export { _addResponsesV2 };
