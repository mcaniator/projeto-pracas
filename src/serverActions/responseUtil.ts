"use server";

import { prisma } from "@/lib/prisma";
import { QuestionTypes } from "@prisma/client";
import { revalidateTag } from "next/cache";

interface ResponseToAdd {
  locationId: number;
  formId: number;
  questionId: number;
  type: QuestionTypes;
  response?: string;
}
const addResponses = async (responses: ResponseToAdd[]) => {
  const responsesTextNumeric = responses.filter(
    (response) => response.type === "NUMERIC" || response.type === "TEXT",
  );
  const responsesOption = responses.filter(
    (response) => response.type === "OPTIONS",
  );
  try {
    await prisma.$transaction([
      prisma.response.createMany({
        data: responsesTextNumeric.map((response) => response),
      }),
      prisma.responseOption.createMany({
        data: responsesOption.map((response) => ({
          optionId: Number(response.response),
          locationId: response.locationId,
          formId: response.formId,
          questionId: response.questionId,
        })),
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

const updateResponse = async (
  responseId: number,
  locationId: number,
  formId: number,
  questionId: number,
  questionType: QuestionTypes,
  newResponse: string,
) => {
  try {
    if (questionType === QuestionTypes.NUMERIC) {
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
    }
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
  updateResponse,
  searchResponsesByQuestionId,
  searchResponsesOptionsByQuestionFormLocation,
  searchResponsesByQuestionFormLocation,
};
