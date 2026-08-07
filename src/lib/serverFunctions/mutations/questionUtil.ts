import { prisma } from "@/lib/prisma";
import { isSupportedDynamicIconKey } from "@/lib/serverFunctions/serverOnly/dynamicIconCatalog";
import { optionSchema, questionSchema } from "@/lib/zodValidators";
import { ZodError, z } from "zod";

import { APIResponseInfo } from "../../types/backendCalls/APIResponse";

const parseQuestionOptions = (formData: FormData, questionId: number) => {
  const optionTexts = formData.getAll("options");
  const isOverridableValues = formData.getAll("optionIsOverridable");

  return optionTexts.map((optionText, index) => {
    const isOverridable = isOverridableValues[index] === "true";

    return {
      text: String(optionText),
      questionId,
      isOverridable,
    };
  });
};

export const questionSubmitDataSchema = z.instanceof(FormData);
export type QuestionSubmitData = z.infer<typeof questionSubmitDataSchema>;

const _questionSubmit = async (
  formData: QuestionSubmitData,
): Promise<{
  responseInfo: APIResponseInfo;
  data: null;
}> => {
  const questionType = formData.get("questionType");
  const questionCharacterType = formData.get("characterType");
  const notes = formData.get("notes") as string;
  const iconKey = formData.get("iconKey");
  const isPublic = formData.get("isPublic") === "true";
  const parseScaleBounds = () => {
    const minValue = Number(formData.get("minValue"));
    const maxValue = Number(formData.get("maxValue"));
    if (!Number.isFinite(minValue) || !Number.isFinite(maxValue)) {
      return { minValue: null, maxValue: null };
    }
    if (minValue >= maxValue) {
      return { minValue: null, maxValue: null };
    }
    return { minValue, maxValue };
  };

  const { minValue, maxValue } = parseScaleBounds();

  switch (questionType) {
    case "WRITTEN":
    case "BOOLEAN": {
      let writtenOrBooleanQuestionParsed;

      try {
        writtenOrBooleanQuestionParsed = questionSchema.parse({
          name: formData.get("name"),
          iconKey: iconKey,
          notes: notes.length > 0 ? notes : null,
          minValue: minValue,
          maxValue: maxValue,
          questionType: questionType,
          characterType: questionCharacterType,
          categoryId: formData.get("categoryId"),
          isPublic: isPublic,
          subcategoryId:
            Number(formData.get("subcategoryId")) > 0 ?
              formData.get("subcategoryId")
            : undefined,
          allowResponseImages: formData.get("allowResponseImages") === "true",
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
      if (questionCharacterType === "SCALE" && !minValue && !maxValue) {
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
          await prisma.question.create({
            data: writtenOrBooleanQuestionParsed,
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

      const subcategoryId =
        Number(formData.get("subcategoryId")) > 0 ?
          formData.get("subcategoryId")
        : undefined;

      if (questionCharacterType === "SCALE" && !minValue && !maxValue) {
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
          minValue: minValue,
          maxValue: maxValue,
          questionType: questionType,
          characterType: questionCharacterType,
          categoryId,
          subcategoryId,
          isPublic: isPublic,
          allowResponseImages: formData.get("allowResponseImages") === "true",
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

        const rawOptions = parseQuestionOptions(formData, 0);
        if (
          questionCharacterType === "SCALE" &&
          minValue != null &&
          maxValue != null
        ) {
          const parsedOptions = rawOptions.map((option) => Number(option.text));
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
            parsedOptions.some((value) => value < minValue || value > maxValue)
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
        if (questionCharacterType !== "TEXT") {
          if (rawOptions.some((o) => o.isOverridable)) {
            return {
              responseInfo: {
                statusCode: 400,
                message: "Sobrescrita de valor usar em questão não textual!",
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
              minValue: optionsQuestionParsed.minValue,
              maxValue: optionsQuestionParsed.maxValue,
              questionType: questionType,
              characterType: optionsQuestionParsed.characterType,
              categoryId: optionsQuestionParsed.categoryId,
              subcategoryId: optionsQuestionParsed.subcategoryId,
              optionType: optionsQuestionParsed.optionType,
              allowResponseImages: optionsQuestionParsed.allowResponseImages,
              geometryTypes: optionsQuestionParsed.geometryTypes,
              isPublic: optionsQuestionParsed.isPublic,
            },
          });

          const options = rawOptions.map((option) => ({
            ...option,
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

export const questionUpdateDataSchema = z.instanceof(FormData);
export type QuestionUpdateData = z.infer<typeof questionUpdateDataSchema>;

const _questionUpdate = async (
  formData: QuestionUpdateData,
): Promise<{ responseInfo: APIResponseInfo }> => {
  try {
    const questionId = Number(formData.get("questionId"));
    const questionType = formData.get("questionType");
    const questionCharacterType = formData.get("characterType");
    const notes = (formData.get("notes") as string | null) ?? "";
    const minValue = Number(formData.get("minValue"));
    const maxValue = Number(formData.get("maxValue"));
    const iconKey = formData.get("iconKey");
    const isPublic = formData.get("isPublic") === "true";
    const rawOptions = parseQuestionOptions(formData, questionId);

    if (!Number.isInteger(questionId) || questionId <= 0) {
      return { responseInfo: { statusCode: 400, message: "Dados inválidos!" } };
    }

    const parsedQuestion = questionSchema.parse({
      name: formData.get("name"),
      iconKey,
      notes: notes.length > 0 ? notes : null,
      minValue,
      maxValue,
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
      allowResponseImages: formData.get("allowResponseImages") === "true",
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
          minValue: parsedQuestion.minValue,
          maxValue: parsedQuestion.maxValue,
          questionType: parsedQuestion.questionType,
          characterType: parsedQuestion.characterType,
          optionType:
            parsedQuestion.questionType === "OPTIONS" ?
              parsedQuestion.optionType
            : null,
          allowResponseImages: parsedQuestion.allowResponseImages,
          geometryTypes: parsedQuestion.geometryTypes ?? [],
          categoryId: parsedQuestion.categoryId,
          subcategoryId: parsedQuestion.subcategoryId ?? null,
        },
        select: {
          name: true,
        },
      });

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

export const deleteQuestionDataSchema = z.instanceof(FormData);
export type DeleteQuestionData = z.infer<typeof deleteQuestionDataSchema>;

const _deleteQuestion = async (formData: DeleteQuestionData) => {
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
