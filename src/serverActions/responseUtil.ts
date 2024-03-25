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
    console.log("o id do local é: " + locationId);
    console.log("o id do formulário é: " + formId);
    console.log("o id da pergunta é: " + questionId);
    console.log("a resposta é: " + response);
    return { statusCode: 2 };
  }

  revalidateTag("response");
  return {
    statusCode: 0,
  };
};

export { addResponses };
