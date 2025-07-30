"use server";

import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@auth/userUtil";
import { ResponseGeometry } from "@customTypes/assessments/geometry";
import { Prisma, QuestionTypes } from "@prisma/client";
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
  console.log(responses);
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
    console.time();
    await prisma.assessment.update({
      where: {
        id: assessmentId,
      },
      data: {
        endDate: endAssessment ? new Date() : null,
      },
    });
    const responsesTextNumericSQLValues = responsesTextNumeric.map(
      (r) =>
        Prisma.sql`(${Prisma.raw(`'${r.type}'::question_types`)}, ${r.response ? r.response[0] : null}, ${user.id}, ${r.questionId}, ${assessmentId}, 'NOW()')`,
    );
    const responsesTextNumericSQL = Prisma.sql`INSERT INTO "response" ("type", "response", "user_id", "question_id", "assessment_id", "updated_at")
    VALUES ${Prisma.join(responsesTextNumericSQLValues, `,`)}
    ON CONFLICT ("assessment_id", "question_id")
    DO UPDATE SET "response" = EXCLUDED."response"`;
    await prisma.$executeRaw(responsesTextNumericSQL);
    console.timeEnd();
    console.time();
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

    if (responseOptionIds.length) {
      const responseOptionUpdate = Prisma.sql`
    UPDATE response_option
    SET option_id = CASE
      ${Prisma.join(caseStatements, "\n")}
      ELSE option_id
    END
    WHERE id IN (${Prisma.join(responseOptionIds)});
  `;
      await prisma.$executeRaw(responseOptionUpdate);
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
        if (!option) return;
        insertValues.push(
          Prisma.sql`(${user.id}, ${assessmentId}, ${questionId}, ${option}, NOW())`,
        );
      }
    }

    if (insertValues.length) {
      const responseOptionInsert = Prisma.sql`INSERT INTO "response_option" ("user_id", "assessment_id", "question_id", "option_id", "updated_at")
      VALUES ${Prisma.join(insertValues, ",")}`;
      await prisma.$executeRaw(responseOptionInsert);
    }

    console.timeEnd();
  } catch (e) {
    console.log(e);
    return {
      statusCode: 500,
    };
  }
  //GEOMETRIES
  console.log("GEOMETRIES QUERY...");
  console.time();
  for (const geometryByQuestion of geometriesByQuestion) {
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
    try {
      if (wktGeometries.length !== 0) {
        const geoText = `GEOMETRYCOLLECTION(${wktGeometries})`;
        await prisma.$executeRaw`
      INSERT INTO question_geometry (assessment_id, question_id, geometry)
      VALUES (${assessmentId}, ${questionId}, ST_GeomFromText(${geoText}, 4326))
      ON CONFLICT (assessment_id, question_id)
      DO UPDATE SET geometry = ST_GeomFromText(${geoText}, 4326)
    `;
      } else {
        await prisma.$executeRaw`
      INSERT INTO question_geometry (assessment_id, question_id, geometry)
      VALUES (${assessmentId}, ${questionId}, NULL)
      ON CONFLICT (assessment_id, question_id)
      DO UPDATE SET geometry = NULL
    `;
      }
    } catch (e) {
      return { statusCode: 500 };
    }
  }
  console.timeEnd();
  return {
    statusCode: 201,
  };
};

export { _addResponses };

export { type ResponseToUpdate };
