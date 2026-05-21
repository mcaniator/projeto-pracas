"use server";

import { prisma } from "@/lib/prisma";
import { isSupportedDynamicIconKey } from "@/lib/serverFunctions/serverOnly/dynamicIconCatalog";
import { optionSchema, questionSchema } from "@/lib/zodValidators";
import { checkIfLoggedInUserHasAnyPermission } from "@serverOnly/checkPermission";
import { ZodError } from "zod";

import { APIResponseInfo } from "../../types/backendCalls/APIResponse";

const _questionSubmit = async (
  prevState: {
    responseInfo: APIResponseInfo;
    data: null;
  } | null,
  formData: FormData,
): Promise<{
  responseInfo: APIResponseInfo;
  data: null;
} | null> => {
  try {
    await checkIfLoggedInUserHasAnyPermission({ roles: ["FORM_MANAGER"] });
  } catch (e) {
    return {
      responseInfo: {
        statusCode: 401,
        message: "Sem permissão para registrar questões!",
      },
      data: null,
    };
  }
  const questionType = formData.get("questionType");
  const questionCharacterType = formData.get("characterType");
  const notes = formData.get("notes") as string;
  const iconKey = formData.get("iconKey");
  const isPublic = formData.get("isPublic") === "true";
  const parseScaleBounds = () => {
    const minValue = Number(formData.get("minValue"));
    const maxValue = Number(formData.get("maxValue"));
    if (!Number.isFinite(minValue) || !Number.isFinite(maxValue)) {
      return null;
    }
    if (minValue >= maxValue) {
      return null;
    }
    return { minValue, maxValue };
  };

  switch (questionType) {
    case "WRITTEN":
    case "BOOLEAN": {
      let writtenOrBooleanQuestionParsed;
      const scaleBounds =
        questionCharacterType === "SCALE" ? parseScaleBounds() : null;

      try {
        writtenOrBooleanQuestionParsed = questionSchema.parse({
          name: formData.get("name"),
          iconKey: iconKey,
          notes: notes.length > 0 ? notes : null,
          questionType: questionType,
          characterType: questionCharacterType,
          categoryId: formData.get("categoryId"),
          isPublic: isPublic,
          subcategoryId:
            Number(formData.get("subcategoryId")) > 0 ?
              formData.get("subcategoryId")
            : undefined,
          geometryTypes:
            (
              formData.getAll("geometryTypes").length > 0 &&
              formData.get("hasAssociatedGeometry") === "true"
            ) ?
              formData.getAll("geometryTypes")
            : undefined,
        });
      } catch (err) {
        return {
          responseInfo: {
            statusCode: 400,
            message: "Dados inválidos para registrar questão!",
          },
          data: null,
        };
      }
      if (questionCharacterType === "SCALE" && !scaleBounds) {
        return {
          responseInfo: {
            statusCode: 400,
            message: "Dados inválidos para registrar questão!",
          },
          data: null,
        };
      }

      try {
        if (
          !isSupportedDynamicIconKey(writtenOrBooleanQuestionParsed.iconKey)
        ) {
          return {
            responseInfo: {
              statusCode: 400,
              message: "Ícone inválido!",
            },
            data: null,
          };
        }

        await prisma.$transaction(async (prisma) => {
          const question = await prisma.question.create({
            data: writtenOrBooleanQuestionParsed,
          });
          if (questionCharacterType === "SCALE" && scaleBounds) {
            await prisma.questionScaleConfig.create({
              data: {
                questionId: question.id,
                minValue: scaleBounds.minValue,
                maxValue: scaleBounds.maxValue,
              },
            });
          }
        });
        return {
          responseInfo: {
            statusCode: 201,
          },
          data: null,
        };
      } catch (err) {
        return {
          responseInfo: {
            statusCode: 500,
            message: "Erro ao registrar questão!",
          },
          data: null,
        };
      }
    }

    case "OPTIONS": {
      const optionType = formData.get("optionType");
      const name = formData.get("name");
      const categoryId = formData.get("categoryId");
      const scaleBounds =
        questionCharacterType === "SCALE" ? parseScaleBounds() : null;
      const subcategoryId =
        Number(formData.get("subcategoryId")) > 0 ?
          formData.get("subcategoryId")
        : undefined;

      if (questionCharacterType === "SCALE" && !scaleBounds) {
        return {
          responseInfo: {
            statusCode: 400,
            message: "Dados inválidos para registrar questão!",
          },
          data: null,
        };
      }
      if (questionCharacterType === "SCALE" && optionType !== "RADIO") {
        return {
          responseInfo: {
            statusCode: 400,
            message: "Dados inválidos para registrar questão!",
          },
          data: null,
        };
      }

      const optionsQuestionObject = { optionType };

      let optionsQuestionParsed;
      try {
        optionsQuestionParsed = questionSchema.parse({
          name,
          iconKey,
          notes: notes.length > 0 ? notes : null,
          questionType: questionType,
          characterType: questionCharacterType,
          categoryId,
          subcategoryId,
          isPublic: isPublic,

          geometryTypes:
            (
              formData.getAll("geometryTypes").length > 0 &&
              formData.get("hasAssociatedGeometry") === "true"
            ) ?
              formData.getAll("geometryTypes")
            : undefined,
          ...optionsQuestionObject,
        });
      } catch (err) {
        return {
          responseInfo: {
            statusCode: 400,
            message: "Dados inválidos para registrar questão!",
          },
          data: null,
        };
      }

      try {
        if (!isSupportedDynamicIconKey(optionsQuestionParsed.iconKey)) {
          return {
            responseInfo: {
              statusCode: 400,
              message: "Ícone inválido!",
            },
            data: null,
          };
        }

        const rawOptions = formData.getAll("options");
        if (questionCharacterType === "SCALE" && scaleBounds) {
          const parsedOptions = rawOptions.map((value) => Number(value));
          if (parsedOptions.some((value) => !Number.isFinite(value))) {
            return {
              responseInfo: {
                statusCode: 400,
                message: "Dados inválidos para registrar questão!",
              },
              data: null,
            };
          }
          if (
            parsedOptions.some(
              (value) =>
                value < scaleBounds.minValue || value > scaleBounds.maxValue,
            )
          ) {
            return {
              responseInfo: {
                statusCode: 400,
                message: "Dados inválidos para registrar questão!",
              },
              data: null,
            };
          }
        }
        await prisma.$transaction(async (prisma) => {
          const newQuestion = await prisma.question.create({
            data: {
              name: optionsQuestionParsed.name,
              iconKey: optionsQuestionParsed.iconKey,
              notes: optionsQuestionParsed.notes,
              questionType: questionType,
              characterType: optionsQuestionParsed.characterType,
              categoryId: optionsQuestionParsed.categoryId,
              subcategoryId: optionsQuestionParsed.subcategoryId,
              optionType: optionsQuestionParsed.optionType,
              geometryTypes: optionsQuestionParsed.geometryTypes,
              isPublic: optionsQuestionParsed.isPublic,
            },
          });

          if (questionCharacterType === "SCALE" && scaleBounds) {
            await prisma.questionScaleConfig.create({
              data: {
                questionId: newQuestion.id,
                minValue: scaleBounds.minValue,
                maxValue: scaleBounds.maxValue,
              },
            });
          }

          const options = rawOptions.map((value) => ({
            text: value,
            questionId: newQuestion.id,
          }));

          const optionsParsed = optionSchema.parse(options);
          await prisma.option.createMany({
            data: optionsParsed,
          });
        });

        return {
          responseInfo: {
            statusCode: 201,
          },
          data: null,
        };
      } catch (err) {
        return {
          responseInfo: {
            statusCode: err instanceof ZodError ? 400 : 500,
            message:
              err instanceof ZodError ?
                "Dados inválidos para registrar questão!"
              : "Erro ao registrar questão!",
          },
          data: null,
        };
      }
    }
  }

  return {
    responseInfo: {
      statusCode: 400,
      message: "Dados inválidos para registrar questão!",
    },
    data: null,
  };
};

const _questionUpdate = async (
  prevState: { responseInfo: { statusCode: number } },
  formData: FormData,
): Promise<{ responseInfo: APIResponseInfo }> => {
  try {
    await checkIfLoggedInUserHasAnyPermission({ roles: ["FORM_MANAGER"] });
  } catch (e) {
    return {
      responseInfo: {
        statusCode: 401,
        message: "Sem permissão para editar questões!",
      },
    };
  }

  try {
    const questionId = Number(formData.get("questionId"));
    const questionType = formData.get("questionType");
    const questionCharacterType = formData.get("characterType");
    const notes = (formData.get("notes") as string | null) ?? "";
    const iconKey = formData.get("iconKey");
    const isPublic = formData.get("isPublic") === "true";
    const rawOptions = formData.getAll("options").map((option) => ({
      text: String(option),
      questionId,
    }));
    const scaleBounds =
      questionCharacterType === "SCALE" ?
        {
          minValue: Number(formData.get("minValue")),
          maxValue: Number(formData.get("maxValue")),
        }
      : null;

    if (!Number.isInteger(questionId) || questionId <= 0) {
      return { responseInfo: { statusCode: 400, message: "Dados inválidos!" } };
    }

    const parsedQuestion = questionSchema.parse({
      name: formData.get("name"),
      iconKey,
      notes: notes.length > 0 ? notes : null,
      questionType,
      characterType: questionCharacterType,
      categoryId: formData.get("categoryId"),
      isPublic,
      subcategoryId:
        Number(formData.get("subcategoryId")) > 0 ?
          formData.get("subcategoryId")
        : undefined,
      optionType:
        questionType === "OPTIONS" ? formData.get("optionType") : undefined,
      geometryTypes:
        (
          formData.getAll("geometryTypes").length > 0 &&
          formData.get("hasAssociatedGeometry") === "true"
        ) ?
          formData.getAll("geometryTypes")
        : undefined,
    });

    if (!isSupportedDynamicIconKey(parsedQuestion.iconKey)) {
      return {
        responseInfo: { statusCode: 400, message: "Ícone inválido!" },
      };
    }

    const question = await prisma.$transaction(async (prisma) => {
      const [questionExistsInForms] = await prisma.$queryRaw<
        { exists: boolean }[]
      >`
        SELECT EXISTS (
          SELECT 1
          FROM "form_item"
          WHERE "question_id" = ${questionId}
        ) AS exists
      `;

      if (!questionExistsInForms) {
        throw new Error("Question not found");
      }
      if (questionExistsInForms.exists) {
        // If the question is being used in any form, it's structure cannot be changed
        const updatedQuestion = await prisma.question.update({
          where: {
            id: questionId,
          },
          data: {
            name: parsedQuestion.name,
            notes: parsedQuestion.notes,
            iconKey: parsedQuestion.iconKey,
            isPublic: parsedQuestion.isPublic,
          },
          select: {
            name: true,
          },
        });
        return updatedQuestion;
      }
      const updatedQuestion = await prisma.question.update({
        where: {
          id: questionId,
        },
        data: {
          name: parsedQuestion.name,
          notes: parsedQuestion.notes,
          iconKey: parsedQuestion.iconKey,
          isPublic: parsedQuestion.isPublic,
          questionType: parsedQuestion.questionType,
          characterType: parsedQuestion.characterType,
          optionType:
            parsedQuestion.questionType === "OPTIONS" ?
              parsedQuestion.optionType
            : null,
          geometryTypes: parsedQuestion.geometryTypes ?? [],
          categoryId: parsedQuestion.categoryId,
          subcategoryId: parsedQuestion.subcategoryId ?? null,
        },
        select: {
          name: true,
        },
      });

      if (parsedQuestion.characterType === "SCALE" && scaleBounds) {
        await prisma.questionScaleConfig.upsert({
          where: {
            questionId,
          },
          create: {
            questionId,
            minValue: scaleBounds.minValue,
            maxValue: scaleBounds.maxValue,
          },
          update: {
            minValue: scaleBounds.minValue,
            maxValue: scaleBounds.maxValue,
          },
        });
      } else {
        await prisma.questionScaleConfig.deleteMany({
          where: {
            questionId,
          },
        });
      }

      await prisma.option.deleteMany({
        where: {
          questionId,
        },
      });
      if (parsedQuestion.questionType === "OPTIONS") {
        const optionsParsed = optionSchema.parse(rawOptions);
        await prisma.option.createMany({
          data: optionsParsed,
        });
      }

      return updatedQuestion;
    });

    return {
      responseInfo: {
        statusCode: 200,
        message: `Questão "${question.name}" editada!`,
        showSuccessCard: true,
      },
    };
  } catch (e) {
    if (e instanceof ZodError) {
      return { responseInfo: { statusCode: 400, message: "Dados inválidos!" } };
    }
    return {
      responseInfo: { statusCode: 500, message: "Erro ao editar questão!" },
    };
  }
};

const _deleteQuestion = async (
  prevState: { responseInfo: APIResponseInfo },
  formData: FormData,
) => {
  try {
    await checkIfLoggedInUserHasAnyPermission({ roles: ["FORM_MANAGER"] });
  } catch (e) {
    return {
      responseInfo: {
        statusCode: 401,
        message: "Sem permissão para excluir questões!",
      } as APIResponseInfo,
      data: {
        formsWithQuestions: [],
      },
    };
  }

  const questionId = parseInt(formData.get("questionId") as string);

  try {
    const formsWithQuestions = await prisma.form.findMany({
      where: {
        formItems: {
          some: {
            questionId: questionId,
          },
        },
      },
      select: {
        name: true,
        formItems: {
          where: {
            questionId: questionId,
          },
          select: {
            question: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (formsWithQuestions.length > 0) {
      return {
        responseInfo: {
          statusCode: 409,
          message:
            "Não foi possí­vel excluir a questão. Ela está sendo usada em outros formulários",
        } as APIResponseInfo,
        data: {
          formsWithQuestions,
        },
      };
    }
  } catch (e) {
    return {
      responseInfo: {
        statusCode: 500,
        message: "Erro ao verificar formulários com esta questão",
      } as APIResponseInfo,
      data: {
        formsWithQuestions: [],
      },
    };
  }

  try {
    const deletedQuestion = await prisma.question.delete({
      where: {
        id: questionId,
      },
      select: {
        name: true,
      },
    });

    return {
      responseInfo: {
        statusCode: 200,
        showSuccessCard: true,
        message: `Questão "${deletedQuestion.name}" excluí­da!`,
      } as APIResponseInfo,
      data: {
        formsWithQuestions: [],
      },
    };
  } catch (e) {
    return {
      responseInfo: {
        statusCode: 500,
        message: "Erro ao excluir questão!",
      } as APIResponseInfo,
      data: {
        formsWithQuestions: [],
      },
    };
  }
};

export { _deleteQuestion, _questionSubmit, _questionUpdate };
