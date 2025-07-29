"use server";

import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@auth/userUtil";
import { ResponseGeometry } from "@customTypes/assessments/geometry";
import { QuestionTypes } from "@prisma/client";
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
        response: {
          upsert: responsesTextNumeric.map((response) => ({
            where: {
              assessmentId_questionId: {
                assessmentId,
                questionId: response.questionId,
              },
            },
            update: {
              response: response.response ? response.response[0] : undefined,
            },
            create: {
              type: response.type,
              response: response.response ? response.response[0] : undefined,
              user: {
                connect: {
                  id: user.id,
                },
              },
              question: {
                connect: {
                  id: response.questionId,
                },
              },
            },
          })),
        },
      },
    });
    console.timeEnd();
    console.time();
    const existing = await prisma.responseOption.findMany({
      where: { assessmentId },
      orderBy: { createdAt: "asc" },
    });
    // groupd responseOption by questionId
    const responseOptionsByQuestion = existing.reduce<
      Record<number, typeof existing>
    >((acc, r) => {
      (acc[r.questionId] ||= []).push(r);
      return acc;
    }, {});

    const responseOptionIds: number[] = [];
    const cases: string[] = [];

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
        cases.push(`WHEN id = ${id} THEN ${newOpt === null ? "NULL" : newOpt}`);
      }
    }

    if (responseOptionIds.length) {
      const idsList = responseOptionIds.join(",");
      const caseSql = cases.join("\n");
      //TODO: CHANGE TO executeRaw. IMPORTANT!
      await prisma.$executeRawUnsafe(`
    UPDATE response_option
    SET option_id = CASE
      ${caseSql}
      ELSE option_id
    END
    WHERE id IN (${idsList});
  `);
    }

    //For each question, in case more options were sent than the current number of reponseOption, an INSERT will be made
    const inserts: Array<[string, number, number, number]> = [];

    for (const { questionId, response } of responsesOption) {
      const opts = response?.includes("null") ? [null] : response.map(Number);
      const existingResponseOptionCount = (
        responseOptionsByQuestion[questionId] || []
      ).length;

      for (let i = existingResponseOptionCount; i < opts.length; i++) {
        const option = opts[i];
        if (!option) return;
        inserts.push([user.id, assessmentId, questionId, option]);
      }
    }

    if (inserts.length) {
      const placeholders = inserts
        .map(
          (_, i) =>
            `($${i * 4 + 1},$${i * 4 + 2},$${i * 4 + 3},$${i * 4 + 4},NOW(),NOW())`,
        )
        .join(",\n");
      const flatInserts = inserts.flat();

      await prisma.$executeRawUnsafe(
        //TODO: change to executeRaw
        `
    INSERT INTO response_option
      (user_id, assessment_id, question_id, option_id, created_at, updated_at)
    VALUES
      ${placeholders};
    `,
        ...flatInserts,
      );
    }

    console.timeEnd();
  } catch (e) {
    console.log(e);
    return {
      statusCode: 500,
    };
  }
  //GEOMETRIES

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
  return {
    statusCode: 201,
  };
};

export { _addResponses };

export { type ResponseToUpdate };
