"use server";

import { prisma } from "@/lib/prisma";
import { QuestionTypes } from "@prisma/client";
import { revalidateTag } from "next/cache";

interface ResponseToAdd {
  locationId: number;
  formId: number;
  questionId: number;
  type: QuestionTypes;
  response?: string[];
}
interface ResponseToUpdate {
  responseId: number;
  locationId: number;
  formId: number;
  questionId: number;
  type: QuestionTypes;
  response?: string;
}
const addResponses = async (
  responses: ResponseToAdd[],
  userId: string,
  formVersion: number,
) => {
  const responsesTextNumeric = responses.filter(
    (response) => response.type === "NUMERIC" || response.type === "TEXT",
  );
  const responsesOption = responses.filter(
    (response) => response.type === "OPTIONS",
  );
  try {
    await prisma.$transaction([
      prisma.response.createMany({
        data: responsesTextNumeric.map((response) => ({
          ...response,
          response: response.response ? response.response[0] : undefined,
          userId,
          formVersion,
        })),
      }),
      prisma.responseOption.createMany({
        data: responsesOption.flatMap((response) =>
          response.response ?
            response.response.map((optionId) => ({
              optionId: Number(optionId),
              locationId: response.locationId,
              formId: response.formId,
              questionId: response.questionId,
              userId: userId,
              formVersion: formVersion,
            }))
          : [],
        ),
      }),
    ]);
  } catch (err) {
    return { statusCode: 2 };
  }

  revalidateTag("response");
  return {
    statusCode: 0,
  };
};

const updateResponses = async (responses: ResponseToUpdate[]) => {
  const responsesTextNumeric = responses.filter(
    (response) => response.type === "NUMERIC" || response.type === "TEXT",
  );
  const responsesOption = responses.filter(
    (response) => response.type === "OPTIONS",
  );
  try {
    await prisma.$transaction([
      ...responsesTextNumeric.map((response) =>
        prisma.response.update({
          where: {
            id: response.responseId,
          },
          data: {
            response: response.response ? response.response : undefined,
          },
        }),
      ),
      ...responsesOption.map((response) =>
        prisma.responseOption.update({
          where: {
            id: response.responseId,
          },
          data: {
            optionId: response.response ? Number(response.response) : undefined,
          },
        }),
      ),
    ]);
    /*if (questionType === QuestionTypes.NUMERIC) {
      await prisma.response.update({
        where: {
          id: responseId,
        },
        data: {
          response: newResponse,
        },
      });
    } else if (questionType === QuestionTypes.TEXT) {
      await prisma.response.update({
        where: {
          id: responseId,
        },
        data: {
          response: newResponse,
        },
      });
    } else if (questionType === QuestionTypes.OPTIONS) {
      const optionId = parseInt(newResponse);

      await prisma.responseOption.update({
        where: {
          id: responseId,
        },
        data: {
          optionId: optionId,
        },
      });
    }*/
  } catch (err) {
    return { statusCode: 2 };
  }

  revalidateTag("response");
  return {
    statusCode: 0,
  };
};

const searchResponsesByQuestionId = async (questionId: number) => {
  return await prisma.response.findMany({
    where: {
      questionId: questionId,
    },
  });
};

const searchResponsesOptionsByQuestionFormLocation = async (
  questionId: number,
  formId: number,
  locationId: number,
) => {
  return await prisma.responseOption.findMany({
    where: {
      questionId,
      locationId,
      formId,
    },
  });
};

const searchResponsesByQuestionFormLocation = async (
  questionId: number,
  formId: number,
  locationId: number,
) => {
  return await prisma.response.findMany({
    where: {
      questionId: questionId,
      formId: formId,
      locationId: locationId,
    },
  });
};

export {
  addResponses,
  updateResponses,
  searchResponsesByQuestionId,
  searchResponsesOptionsByQuestionFormLocation,
  searchResponsesByQuestionFormLocation,
};

export { type ResponseToUpdate };
