"use server";

import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@auth/userUtil";
import { ResponseGeometry } from "@customTypes/assessments/geometry";
import { Prisma, QuestionTypes } from "@prisma/client";
import { DefaultArgs } from "@prisma/client/runtime/library";
import { checkIfLoggedInUserHasAnyPermission } from "@serverOnly/checkPermission";
import { Coordinate } from "ol/coordinate";

interface ResponseToAdd {
  questionId: number;
  type: QuestionTypes;
  response: string[];
}
interface ResponseToUpdate {
  responseId: number[];
  locationId: number;
  formId: number;
  questionId: number;
  type: QuestionTypes;
  value: string[];
}

const _addResponses = async (
  assessmentId: number,
  responses: ResponseToAdd[],
  geometriesByQuestion: {
    questionId: number;
    geometries: ResponseGeometry[];
  }[],
  endAssessment: boolean,
) => {
  try {
    await checkIfLoggedInUserHasAnyPermission({
      roles: ["ASSESSMENT_EDITOR", "ASSESSMENT_MANAGER"],
    });
  } catch (e) {
    return {
      statusCode: 401,
    };
  }
  const user = await getSessionUser();
  const assessment = await prisma.assessment.findUnique({
    where: {
      id: assessmentId,
    },
    select: {
      userId: true,
    },
  });
  if (!assessment || !user) {
    return {
      statusCode: 404,
    };
  }
  if (user.id !== assessment?.userId) {
    try {
      await checkIfLoggedInUserHasAnyPermission({
        roles: ["ASSESSMENT_MANAGER"],
      });
    } catch (e) {
      return { statusCode: 401 };
    }
  }
  const responsesTextNumeric = responses.filter(
    (response) => response.type === "WRITTEN",
  );
  const responsesOption = responses.filter(
    (response) => response.type === "OPTIONS",
  );
  try {
    const assessmentUpdate = prisma.assessment.update({
      where: {
        id: assessmentId,
      },
      data: {
        endDate: endAssessment ? new Date() : null,
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

    const responsesTextNumericSQLValues = responsesTextNumeric.map(
      (r) =>
        Prisma.sql`(${r.response ? r.response[0] : null}, ${user.id}, ${r.questionId}, ${assessmentId}, 'NOW()')`,
    );
    const responsesTextNumericQuery = Prisma.sql`INSERT INTO "response" ("response", "user_id", "question_id", "assessment_id", "updated_at")
    VALUES ${Prisma.join(responsesTextNumericSQLValues, `,`)}
    ON CONFLICT ("assessment_id", "question_id")
    DO UPDATE SET "response" = EXCLUDED."response"`;

    transactions.push(prisma.$executeRaw(responsesTextNumericQuery));

    const existing = await prisma.responseOption.findMany({
      where: { assessmentId },
      orderBy: { createdAt: "asc" },
    });
    // group responseOption by questionId
    const responseOptionsByQuestion = existing.reduce<
      Record<number, typeof existing>
    >((acc, r) => {
      (acc[r.questionId] ||= []).push(r);
      return acc;
    }, {});

    const responseOptionIds: number[] = [];
    const caseStatements: Prisma.Sql[] = [];

    for (const { questionId, response } of responsesOption) {
      const opts =
        response?.includes("null") ?
          [] //"null" sent means no option was selected. TODO: CHANGE TO CHECK IF AN EMPTY ARRAY WAS SENT
        : response.map((s) => Number(s));

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

    if (responseOptionIds.length > 0) {
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
    for (const { questionId, response } of responsesOption) {
      const opts = response?.includes("null") ? [null] : response.map(Number);
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
    const geometryValues = geometriesByQuestion.map((geometryByQuestion) => {
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
  } catch (e) {
    return { statusCode: 500 };
  }

  return {
    statusCode: 201,
  };
};

export { _addResponses };

export { type ResponseToUpdate };
