"use server";

import { prisma } from "@/lib/prisma";
import { revalidateTag } from "next/cache";

const addResponses = async (
  locationId: number,
  formId: number,
  questionId: number,
  response?: string,
) => {
  try {
    await prisma.response.create({
      data: {
        locationId: locationId,
        formId: formId,
        questionId: questionId,
        response: response,
      },
    });
  } catch (err) {
    console.log(err);
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
  searchResponsesByQuestionId,
  searchResponsesByQuestionFormLocation,
};
