"use server";

import { ModalGeometry } from "@/components/singleUse/admin/response/responseForm";
import { prisma } from "@/lib/prisma";
import { QuestionTypes } from "@prisma/client";
import { Coordinate } from "ol/coordinate";

interface ResponseToAdd {
  questionId: number;
  type: QuestionTypes;
  response?: string[];
}
interface ResponseToUpdate {
  responseId: number[];
  locationId: number;
  formId: number;
  questionId: number;
  type: QuestionTypes;
  value: string[];
}

const addResponses = async (
  assessmentId: number,
  responses: ResponseToAdd[],
  geometriesByQuestion: { questionId: number; geometries: ModalGeometry[] }[],
  userId: string,
  endAssessment: boolean,
) => {
  const responsesTextNumeric = responses.filter(
    (response) => response.type === "WRITTEN",
  );
  const responsesOption = responses.filter(
    (response) => response.type === "OPTIONS",
  );
  try {
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
                  id: userId,
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
    const existingResponseOptions = await prisma.responseOption.findMany({
      where: {
        assessmentId,
        userId,
      },
    });
    for (const currentResponseOption of responsesOption) {
      const existingResponseOptionsToCurrentQuestion =
        existingResponseOptions.filter(
          (responseOption) =>
            responseOption.questionId === currentResponseOption.questionId,
        );

      if (currentResponseOption.response?.includes("null")) {
        if (existingResponseOptionsToCurrentQuestion.length === 0) {
          await prisma.responseOption.create({
            data: {
              user: {
                connect: { id: userId },
              },
              question: {
                connect: { id: currentResponseOption.questionId },
              },
              assessment: {
                connect: { id: assessmentId },
              },
            },
          });
        } else {
          await prisma.responseOption.updateMany({
            where: {
              assessmentId,
              questionId: currentResponseOption.questionId,
              userId,
            },
            data: {
              optionId: null,
            },
          });
        }
      } else {
        const optionIds =
          currentResponseOption.response?.map((id) => Number(id)) || [];

        for (let i = 0; i < optionIds.length; i++) {
          const optionId = optionIds[i];

          if (i < existingResponseOptionsToCurrentQuestion.length) {
            const currentExistingResponseOptionsToCurrentQuestion =
              existingResponseOptionsToCurrentQuestion[i];
            if (currentExistingResponseOptionsToCurrentQuestion) {
              await prisma.responseOption.update({
                where: {
                  id: currentExistingResponseOptionsToCurrentQuestion.id,
                },
                data: {
                  option: {
                    connect: { id: optionId },
                  },
                },
              });
            }
          } else {
            await prisma.responseOption.create({
              data: {
                user: {
                  connect: { id: userId },
                },
                question: {
                  connect: { id: currentResponseOption.questionId },
                },
                assessment: {
                  connect: { id: assessmentId },
                },
                option: {
                  connect: { id: optionId },
                },
              },
            });
          }
        }

        if (
          existingResponseOptionsToCurrentQuestion.length > optionIds.length
        ) {
          const excessResponseOptions =
            existingResponseOptionsToCurrentQuestion.slice(optionIds.length);
          await prisma.responseOption.updateMany({
            where: {
              id: {
                in: excessResponseOptions.map(
                  (excessResponseOption) => excessResponseOption.id,
                ),
              },
            },
            data: {
              optionId: null,
            },
          });
        }
      }
    }
  } catch (e) {
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
    statusCode: 200,
  };
};

const searchResponsesByQuestionId = async (questionId: number) => {
  return await prisma.response.findMany({
    where: {
      questionId: questionId,
    },
  });
};

export { addResponses, searchResponsesByQuestionId };

export { type ResponseToUpdate };
