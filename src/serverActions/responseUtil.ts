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
    // Se o tipo de pergunta for "Numeric"
    if (questionType === QuestionTypes.NUMERIC && response) {
      // Verificar se já existe uma resposta para essa pergunta, formulário e localização
      const existingResponse = await prisma.response.findFirst({
        where: {
          questionId: questionId,
          formId: formId,
          locationId: locationId,
          type: QuestionTypes.NUMERIC,
          response: response,
        },
      });

      // Se já existir uma resposta, atualize a frequência
      if (existingResponse) {
        await prisma.response.update({
          where: {
            id: existingResponse.id,
          },
          data: {
            frequency: {
              increment: 1, // Incrementa a frequência em 1
            },
          },
        });
      } else {
        // Se não existir, crie uma nova resposta
        await prisma.response.create({
          data: {
            locationId: locationId,
            formId: formId,
            questionId: questionId,
            type: questionType,
            response: response,
            frequency: 1, // Define a frequência inicial como 1
          },
        });
      }
    } else {
      // Se o tipo de pergunta não for "Numeric" ou se a resposta for vazia, crie uma nova resposta como antes
      await prisma.response.create({
        data: {
          locationId: locationId,
          formId: formId,
          questionId: questionId,
          type: questionType,
          response: response,
        },
      });
    }
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
