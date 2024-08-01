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
      const existingResponse = await prisma.response.findFirst({
        where: {
          questionId: questionId,
          formId: formId,
          locationId: locationId,
          type: QuestionTypes.NUMERIC,
          response: response,
        },
      });

      if (existingResponse) {
        await prisma.response.update({
          where: {
            id: existingResponse.id,
          },
          data: {
            frequency: {
              increment: 1,
            },
          },
        });
      } else {
        await prisma.response.create({
          data: {
            locationId: locationId,
            formId: formId,
            questionId: questionId,
            type: questionType,
            response: response,
            frequency: 1,
          },
        });
      }
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

      const existingResponseOption = await prisma.responseOption.findFirst({
        where: {
          questionId: questionId,
          formId: formId,
          locationId: locationId,
          optionId: optionId,
        },
      });

      if (existingResponseOption) {
        await prisma.responseOption.update({
          where: {
            id: existingResponseOption.id,
          },
          data: {
            frequency: {
              increment: 1,
            },
          },
        });
      } else {
        await prisma.responseOption.create({
          data: {
            locationId: locationId,
            formId: formId,
            questionId: questionId,
            optionId: optionId,
            frequency: 1,
          },
        });
      }
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

const searchResponsesByLocation = async (locationId: number) => {
  return await prisma.response.findMany({
    where: {
      locationId: locationId,
    },
    select: {
      id: true,
      createdAt: true,
    },
  });
};

const searchResponsesOptionsByLocation = async (locationId: number) => {
  return await prisma.responseOption.findMany({
    where: {
      locationId: locationId,
    },
    select: {
      id: true,
      createdAt: true,
    },
  });
};

export {
  addResponses,
  updateResponse,
  searchResponsesByQuestionId,
  searchResponsesOptionsByQuestionId,
  searchResponsesByQuestionFormLocation,
  searchResponsesByLocation,
  searchResponsesOptionsByLocation,
};
