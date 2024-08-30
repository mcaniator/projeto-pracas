"use server";

import { prisma } from "@/lib/prisma";
import { QuestionTypes } from "@prisma/client";
import { revalidateTag } from "next/cache";

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
  userId: string,
  endAssessment: boolean,
) => {
  const responsesTextNumeric = responses.filter(
    (response) => response.type === "NUMERIC" || response.type === "TEXT",
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
      statusCode: 2,
    };
  }
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
    include: {
      user: {
        select: {
          username: true,
        },
      },
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
    include: {
      user: {
        select: {
          username: true,
        },
      },
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
