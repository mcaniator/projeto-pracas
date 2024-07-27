"use server";

import { prisma } from "@/lib/prisma";
import { QuestionTypes } from "@prisma/client";
import { revalidateTag } from "next/cache";

const addResponses = async (
  locationId: number,
  formId: number,
  questionId: number,
  questionType: QuestionTypes,
  response?: string,
) => {
  try {
    if (questionType === QuestionTypes.NUMERIC && response) {
      await prisma.response.create({
        data: {
          locationId: locationId,
          formId: formId,
          questionId: questionId,
          type: questionType,
          response: response,
        },
      });
    } else if (questionType === QuestionTypes.TEXT && response) {
      await prisma.response.create({
        data: {
          locationId: locationId,
          formId: formId,
          questionId: questionId,
          type: questionType,
          response: response,
        },
      });
    } else if (questionType === QuestionTypes.OPTIONS && response) {
      const optionId = parseInt(response);

      await prisma.responseOption.create({
        data: {
          locationId: locationId,
          formId: formId,
          questionId: questionId,
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

const searchResponsesOptionsByQuestionId = async (questionId: number) => {
  return await prisma.responseOption.findMany({
    where: {
      questionId: questionId,
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
  searchResponsesOptionsByQuestionId,
  searchResponsesByQuestionFormLocation,
};
