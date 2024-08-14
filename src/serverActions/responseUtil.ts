"use server";

import { prisma } from "@/lib/prisma";
import { QuestionTypes } from "@prisma/client";
import { connect } from "http2";
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
  const responsesTextNumeric = responses.filter(
    (response) => response.type === "NUMERIC" || response.type === "TEXT",
  );
  const responsesOption = responses.filter(
    (response) => response.type === "OPTIONS",
  );
  console.log(responsesOption);
  try {
    let submissionDate: {
      createdAt: Date;
      userId: string;
      formVersion: number;
    };
    if (responsesOption[0]) {
      submissionDate = await prisma.responseOption.findUnique({
        where: {
          id: Number(responsesOption[0].responseId[0]),
        },
        select: {
          createdAt: true,
          userId: true,
          formVersion: true,
        },
      });
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
      ...responsesOption.map(
        (response) => {
          if (response.responseId.length >= response.value.length) {
            const quantityResponsesOptionToDelete =
              response.responseId.length - response.value.length;
            const responsesOptionToDeleteIds: number[] = [];
            for (let i = 0; i < quantityResponsesOptionToDelete; i++) {
              if (response.responseId[0]) {
                responsesOptionToDeleteIds.push(response.responseId[0]);
                response.responseId.shift();
              }
            }
            prisma.responseOption
              .deleteMany({
                where: {
                  id: {
                    in: responsesOptionToDeleteIds,
                  },
                },
              })
              .catch(() => ({ statusCode: 2 }));
            for (let i = 0; i < response.value.length; i++) {
              prisma.responseOption
                .update({
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
                })
                .catch(() => ({ statusCode: 2 }));
            }
          } else {
            //const responsesOptionToCreate = response.value.length - response.responseId.length;

            for (let i = 0; i < response.value.length; i++) {
              if (response.responseId[i]) {
                prisma.responseOption
                  .upsert({
                    where: {
                      id: Number(response.responseId[i]),
                    },
                    update: {
                      option: {
                        connect: {
                          id: Number(response.value[i]),
                        },
                      },
                    },
                    create: {
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
                          id: submissionDate.userId,
                        },
                      },
                      form: {
                        connect: {
                          id: response.formId,
                        },
                      },
                      formVersion: submissionDate.formVersion,
                      createdAt: submissionDate.createdAt,
                      option: {
                        connect: {
                          id: Number(response.value[i]),
                        },
                      },
                    },
                  })
                  .catch(() => ({ statusCode: 2 }));
              } else {
                prisma.responseOption
                  .create({
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
                          id: "z5tg10gr63f9hfn",
                        },
                      },
                      form: {
                        connect: {
                          id: response.formId,
                        },
                      },
                      formVersion: 4,
                      createdAt: submissionDate.createdAt,
                      option: {
                        connect: {
                          id: Number(response.value[i]),
                        },
                      },
                    },
                  })
                  .catch(() => ({ statusCode: 2 }));
              }
            }
          }
          return prisma.responseOption.count({
            //
          });
        },
        /*prisma.responseOption.update({
          where: {
            id: response.responseId,
          },
          data: {
            optionId: response.response ? Number(response.response) : undefined,
          },
        }),*/
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
