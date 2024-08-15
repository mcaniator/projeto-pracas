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
  responseId: number[];
  locationId: number;
  formId: number;
  questionId: number;
  type: QuestionTypes;
  value: string[];
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
  type ResponsePromise =
    | ReturnType<typeof prisma.response.update>
    | ReturnType<typeof prisma.responseOption.upsert>
    | ReturnType<typeof prisma.responseOption.deleteMany>;

  const responsesTextNumeric = responses.filter(
    (response) => response.type === "NUMERIC" || response.type === "TEXT",
  );
  const responsesOption = responses.filter(
    (response) => response.type === "OPTIONS",
  );
  try {
    let submmitData: {
      createdAt: Date;
      userId: string;
      formVersion: number;
    };
    if (responsesOption[0]) {
      const responseObj = await prisma.responseOption.findUnique({
        where: {
          id: Number(responsesOption[0].responseId[0]),
        },
        select: {
          createdAt: true,
          userId: true,
          formVersion: true,
        },
      });
      if (responseObj) {
        submmitData = responseObj;
      }
    }

    await prisma.$transaction([
      ...responsesTextNumeric.map((response) =>
        prisma.response.update({
          where: {
            id: response.responseId[0],
          },
          data: {
            response: response.value[0],
          },
        }),
      ),
      ...responsesOption.flatMap((response) => {
        const transactionPromises: ResponsePromise[] = [];
        if (response.responseId.length >= response.value.length) {
          const quantityResponsesOptionToNullify =
            response.responseId.length - response.value.length;
          const responsesOptionToNullifyIds: number[] = [];
          for (let i = 0; i < quantityResponsesOptionToNullify; i++) {
            if (response.responseId[0]) {
              responsesOptionToNullifyIds.push(response.responseId[0]);
              response.responseId.shift();
            }
          }
          transactionPromises.push(
            prisma.responseOption.updateMany({
              where: {
                id: {
                  in: responsesOptionToNullifyIds,
                },
              },
              data: {
                optionId: null,
              },
            }),
          );

          for (let i = 0; i < response.value.length; i++) {
            transactionPromises.push(
              prisma.responseOption.update({
                where: {
                  id: response.responseId[i],
                },
                data: {
                  option: {
                    connect: {
                      id: Number(response.value[i]),
                    },
                  },
                },
              }),
            );
          }
        } else {
          for (let i = 0; i < response.value.length; i++) {
            if (response.responseId[i]) {
              transactionPromises.push(
                prisma.responseOption.update({
                  where: {
                    id: Number(response.responseId[i]),
                  },
                  data: {
                    option: {
                      connect: {
                        id: Number(response.value[i]),
                      },
                    },
                  },
                }),
              );
            } else {
              transactionPromises.push(
                prisma.responseOption.create({
                  data: {
                    location: {
                      connect: {
                        id: response.locationId,
                      },
                    },
                    question: {
                      connect: {
                        id: response.questionId,
                      },
                    },
                    user: {
                      connect: {
                        id: submmitData.userId,
                      },
                    },
                    form: {
                      connect: {
                        id: response.formId,
                      },
                    },
                    formVersion: submmitData.formVersion,
                    createdAt: submmitData.createdAt,
                    option: {
                      connect: {
                        id: Number(response.value[i]),
                      },
                    },
                  },
                }),
              );
            }
          }
        }
        return transactionPromises;
      }),
    ]);
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
