import {
  categoryInfoToCreateSchema,
  subcategoryInfoToCreateSchema,
} from "@/lib/zodValidators";
import { prisma } from "@lib/prisma";
import { Prisma } from "@prisma/client";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { z } from "zod";

import {
  APIRequestData,
  APIResponseInfo,
} from "../../types/backendCalls/APIResponse";

export const categorySubmitDataSchema = z.instanceof(FormData);
export type CategorySubmitData = z.infer<typeof categorySubmitDataSchema>;

const _categorySubmit = async (request: APIRequestData<CategorySubmitData>) => {
  const formData = request.data!;
  let parse;
  try {
    parse = categoryInfoToCreateSchema.parse({
      formUse: formData.get("formUse"),
      name: formData.get("name"),
      notes: formData.get("notes"),
      allowGeometryAssociation: formData.get("allowGeometryAssociation"),
      geometryTypes: formData.getAll("geometryTypes"),
      categoryId: formData.get("categoryId"),
      cloneCategoryId: formData.get("cloneCategoryId"),
    });
  } catch (e) {
    return {
      responseInfo: {
        statusCode: 400,
        message: "Dados inválidos!",
      } as APIResponseInfo,
      data: null,
    };
  }

  try {
    if (parse.cloneCategoryId) {
      const sourceCategory = await prisma.category.findUnique({
        where: { id: parse.cloneCategoryId },
        select: {
          formUse: true,
          optional: true,
          active: true,
          allowGeometryAssociation: true,
          geometryTypes: true,
          subcategory: {
            select: {
              id: true,
              name: true,
              optional: true,
              active: true,
              notes: true,
              allowGeometryAssociation: true,
              geometryTypes: true,
            },
          },
          question: {
            select: {
              id: true,
              formUse: true,
              name: true,
              iconKey: true,
              notes: true,
              isPublic: true,
              allowResponseImages: true,
              minValue: true,
              maxValue: true,
              questionType: true,
              characterType: true,
              optionType: true,
              geometryTypes: true,
              subcategoryId: true,
              options: {
                select: {
                  text: true,
                  isOverridable: true,
                },
              },
            },
          },
        },
      });

      if (!sourceCategory) {
        return {
          responseInfo: {
            statusCode: 404,
            message: "Categoria não encontrada!",
          } as APIResponseInfo,
          data: null,
        };
      }

      if (sourceCategory.formUse !== parse.formUse) {
        return {
          responseInfo: {
            statusCode: 400,
            message:
              "A categoria selecionada não pertence a este tipo de formulário!",
          } as APIResponseInfo,
          data: null,
        };
      }

      await prisma.$transaction(async (tx) => {
        const category = await tx.category.create({
          data: {
            formUse: parse.formUse,
            name: parse.name,
            notes: parse.notes ?? null,
            optional: sourceCategory.optional,
            active: sourceCategory.active,
            allowGeometryAssociation: parse.allowGeometryAssociation,
            geometryTypes: parse.geometryTypes,
          },
          select: { id: true },
        });

        const subcategoryValues = sourceCategory.subcategory.map(
          (subcategory) =>
            Prisma.sql`(${parse.formUse}::"FORM_USE", ${subcategory.name}, ${subcategory.optional}, ${subcategory.active}, ${subcategory.notes}, ${subcategory.allowGeometryAssociation}, ${
              subcategory.geometryTypes.length > 0 ?
                Prisma.sql`ARRAY[${Prisma.join(
                  subcategory.geometryTypes.map(
                    (geometryType) =>
                      Prisma.sql`${geometryType}::"QuestionGeometryTypes"`,
                  ),
                  ",",
                )}]`
              : Prisma.sql`ARRAY[]::"QuestionGeometryTypes"[]`
            }, ${category.id})`,
        );
        const subcategoryIds = new Map<number, number>();

        if (subcategoryValues.length > 0) {
          const createdSubcategories = await tx.$queryRaw<
            { id: number; name: string }[]
          >(Prisma.sql`
            INSERT INTO "subcategory" (
              "form_use",
              "name",
              "optional",
              "active",
              "notes",
              "allow_geometry_association",
              "geometry_types",
              "category_id"
            )
            VALUES ${Prisma.join(subcategoryValues, ",")}
            RETURNING "id", "name"
          `);

          const subcategoryIdsByName = new Map(
            createdSubcategories.map((subcategory) => [
              subcategory.name,
              subcategory.id,
            ]),
          );
          sourceCategory.subcategory.forEach((subcategory) => {
            const newSubcategoryId = subcategoryIdsByName.get(subcategory.name);
            if (!newSubcategoryId) {
              throw new Error("Subcategoria clonada não encontrada");
            }
            subcategoryIds.set(subcategory.id, newSubcategoryId);
          });
        }

        const questionValues = sourceCategory.question.map((question) => {
          const subcategoryId =
            question.subcategoryId === null ?
              null
            : subcategoryIds.get(question.subcategoryId);
          if (question.subcategoryId !== null && !subcategoryId) {
            throw new Error("Subcategoria da questão clonada não encontrada");
          }

          const geometryTypes =
            question.geometryTypes.length > 0 ?
              Prisma.sql`ARRAY[${Prisma.join(
                question.geometryTypes.map(
                  (geometryType) =>
                    Prisma.sql`${geometryType}::"QuestionGeometryTypes"`,
                ),
                ",",
              )}]`
            : Prisma.sql`ARRAY[]::"QuestionGeometryTypes"[]`;

          return Prisma.sql`(
            ${question.formUse}::"FORM_USE",
            ${question.name},
            ${question.iconKey},
            ${question.notes},
            ${question.isPublic},
            ${question.allowResponseImages},
            ${question.minValue},
            ${question.maxValue},
            ${question.questionType}::"question_types",
            ${question.characterType}::"question_response_character_types",
            ${question.optionType ? Prisma.sql`${question.optionType}::"option_types"` : Prisma.sql`NULL`},
            ${geometryTypes},
            ${category.id},
            ${subcategoryId},
            CURRENT_TIMESTAMP
          )`;
        });
        const questionIds = new Map<number, number>();

        if (questionValues.length > 0) {
          const createdQuestions = await tx.$queryRaw<
            { id: number; name: string; subcategory_id: number | null }[]
          >(Prisma.sql`
            INSERT INTO "question" (
              "form_use",
              "name",
              "icon_key",
              "notes",
              "is_public",
              "allow_response_images",
              "min_value",
              "max_value",
              "question_type",
              "character_type",
              "option_type",
              "geometry_types",
              "category_id",
              "subcategory_id",
              "updated_at"
            )
            VALUES ${Prisma.join(questionValues, ",")}
            RETURNING "id", "name", "subcategory_id"
          `);

          const questionIdsByLocationAndName = new Map(
            createdQuestions.map((question) => [
              `${question.subcategory_id ?? 0}:${question.name}`,
              question.id,
            ]),
          );
          sourceCategory.question.forEach((question) => {
            const newSubcategoryId =
              question.subcategoryId === null ?
                null
              : subcategoryIds.get(question.subcategoryId);
            const newQuestionId = questionIdsByLocationAndName.get(
              `${newSubcategoryId ?? 0}:${question.name}`,
            );
            if (!newQuestionId) {
              throw new Error("Questão clonada não encontrada");
            }
            questionIds.set(question.id, newQuestionId);
          });
        }

        const optionValues = sourceCategory.question.flatMap((question) => {
          const questionId = questionIds.get(question.id);
          if (!questionId) {
            throw new Error("Questão das opções clonadas não encontrada");
          }
          return question.options.map(
            (option) =>
              Prisma.sql`(${option.text}, ${questionId}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, ${option.isOverridable})`,
          );
        });

        if (optionValues.length > 0) {
          await tx.$executeRaw(Prisma.sql`
            INSERT INTO "option" (
              "text",
              "question_id",
              "created_at",
              "updated_at",
              "is_overridable"
            )
            VALUES ${Prisma.join(optionValues, ",")}
          `);
        }
      });

      return {
        responseInfo: {
          statusCode: 201,
          message: `Categoria ${parse.name} clonada!`,
        } as APIResponseInfo,
        data: null,
      };
    }

    if (parse.categoryId) {
      const category = await prisma.category.update({
        where: { id: parse.categoryId },
        data: {
          name: parse.name,
          notes: parse.notes,
          allowGeometryAssociation: parse.allowGeometryAssociation,
          geometryTypes: parse.geometryTypes,
        },
      });
      return {
        responseInfo: {
          statusCode: 201,
          message: `Categoria ${category.name} editada!`,
        } as APIResponseInfo,
        data: null,
      };
    }
    const category = await prisma.category.create({
      data: {
        formUse: parse.formUse,
        name: parse.name,
        notes: parse.notes,
        allowGeometryAssociation: parse.allowGeometryAssociation,
        geometryTypes: parse.geometryTypes,
      },
    });
    return {
      responseInfo: {
        statusCode: 201,
        message: `Categoria ${category.name} criada!`,
      } as APIResponseInfo,
      data: null,
    };
  } catch (e) {
    if (e instanceof PrismaClientKnownRequestError)
      if (e.code === "P2002")
        return {
          responseInfo: {
            statusCode: 409,
            message: `Já existe uma categoria de nome ${parse.name}`,
          } as APIResponseInfo,
          data: null,
        };
    return {
      responseInfo: {
        statusCode: 500,
        message: `Erro ao criar categoria!`,
      } as APIResponseInfo,
      data: null,
    };
  }
};

export const deleteCategoryDataSchema = z.instanceof(FormData);
export type DeleteCategoryData = z.infer<typeof deleteCategoryDataSchema>;

const _deleteCategory = async (
  request: APIRequestData<DeleteCategoryData>,
): Promise<{
  responseInfo: APIResponseInfo;
  data: {
    formsWithQuestions: {
      name: string;
      formItems: {
        question: {
          id: number;
          name: string;
        } | null;
      }[];
    }[];
  } | null;
}> => {
  const formData = request.data!;
  const categoryId = parseInt(formData.get("categoryId") as string);

  try {
    const formsWithQuestions = await prisma.form.findMany({
      where: {
        formItems: {
          some: {
            question: {
              categoryId: categoryId,
            },
          },
        },
      },
      select: {
        name: true,
        formItems: {
          where: {
            categoryId: categoryId,
            questionId: {
              not: null,
            },
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
            "Não foi possível excluir a categoria. Há questões pertencentes a ela usadas em formulários.",
        } as APIResponseInfo,
        data: {
          formsWithQuestions,
        },
      };
    }
  } catch (e) {
    return {
      responseInfo: { statusCode: 500, message: "Erro ao excluir categoria!" },
      data: null,
    };
  }
  try {
    let deletedCategoryName = "";
    await prisma.$transaction(async (tx) => {
      await tx.question.deleteMany({
        where: {
          categoryId: categoryId,
        },
      });
      await tx.subcategory.deleteMany({
        where: {
          categoryId: categoryId,
        },
      });
      const deletedCategory = await tx.category.delete({
        where: {
          id: categoryId,
        },
      });
      deletedCategoryName = deletedCategory.name;
    });

    return {
      responseInfo: {
        statusCode: 200,
        message: `Categoria "${deletedCategoryName}" excluída!`,
      },
      data: null,
    };
  } catch (e) {
    return {
      responseInfo: { statusCode: 500, message: "Erro ao excluir categoria!" },
      data: null,
    };
  }
};

export const deleteSubcategoryDataSchema = z.instanceof(FormData);
export type DeleteSubcategoryData = z.infer<typeof deleteSubcategoryDataSchema>;

const _deleteSubcategory = async (
  request: APIRequestData<DeleteSubcategoryData>,
): Promise<{
  responseInfo: APIResponseInfo;
  data: {
    formsWithQuestions: {
      name: string;
      formItems: {
        question: {
          id: number;
          name: string;
        } | null;
      }[];
    }[];
  } | null;
}> => {
  const formData = request.data!;
  const subcategoryId = parseInt(formData.get("subcategoryId") as string);
  try {
    const formsWithQuestions = await prisma.form.findMany({
      where: {
        formItems: {
          some: {
            question: {
              subcategoryId: subcategoryId,
            },
          },
        },
      },
      select: {
        name: true,
        formItems: {
          where: {
            subcategoryId: subcategoryId,
            questionId: {
              not: null,
            },
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
            "Não foi possível excluir a subcategoria. Há questões pertencentes a ela usadas em formulários.",
        } as APIResponseInfo,
        data: {
          formsWithQuestions,
        },
      };
    }
  } catch (e) {
    return {
      responseInfo: { statusCode: 500, message: "Erro ao excluir categoria!" },
      data: null,
    };
  }
  try {
    let deletedSubcategoryName = "";
    await prisma.$transaction(async (tx) => {
      await tx.question.deleteMany({
        where: {
          subcategoryId: subcategoryId,
        },
      });
      const deletedSubcategory = await tx.subcategory.delete({
        where: {
          id: subcategoryId,
        },
      });

      deletedSubcategoryName = deletedSubcategory.name;
    });
    return {
      responseInfo: {
        statusCode: 200,
        message: `Subcategoria "${deletedSubcategoryName}" excluída!`,
      },
      data: null,
    };
  } catch (e) {
    return {
      responseInfo: {
        statusCode: 500,
        message: "Erro ao excluir subcategoria!",
      },
      data: null,
    };
  }
};

export const subcategorySubmitDataSchema = z.instanceof(FormData);
export type SubcategorySubmitData = z.infer<typeof subcategorySubmitDataSchema>;

const _subcategorySubmit = async (
  request: APIRequestData<SubcategorySubmitData>,
) => {
  const formData = request.data!;
  let parse;
  try {
    parse = subcategoryInfoToCreateSchema.parse({
      formUse: formData.get("formUse"),
      name: formData.get("subcategory-name"),
      categoryId: formData.get("category-id"),
      notes: formData.get("notes"),
      allowGeometryAssociation: formData.get("allowGeometryAssociation"),
      geometryTypes: formData.getAll("geometryTypes"),
      subcategoryId: formData.get("subcategoryId"),
      cloneSubcategoryId: formData.get("cloneSubcategoryId"),
    });
  } catch (e) {
    return {
      responseInfo: {
        statusCode: 400,
        message: "Dados inválidos!",
      } as APIResponseInfo,
      data: null,
    };
  }

  try {
    if (parse.cloneSubcategoryId) {
      const sourceSubcategory = await prisma.subcategory.findUnique({
        where: { id: parse.cloneSubcategoryId },
        select: {
          formUse: true,
          categoryId: true,
          optional: true,
          active: true,
          allowGeometryAssociation: true,
          geometryTypes: true,
          question: {
            select: {
              id: true,
              formUse: true,
              name: true,
              iconKey: true,
              notes: true,
              isPublic: true,
              allowResponseImages: true,
              minValue: true,
              maxValue: true,
              questionType: true,
              characterType: true,
              optionType: true,
              geometryTypes: true,
              options: {
                select: {
                  text: true,
                  isOverridable: true,
                },
              },
            },
          },
        },
      });

      if (!sourceSubcategory) {
        return {
          responseInfo: {
            statusCode: 404,
            message: "Subcategoria não encontrada!",
          } as APIResponseInfo,
          data: null,
        };
      }

      if (
        sourceSubcategory.formUse !== parse.formUse ||
        sourceSubcategory.categoryId !== parse.categoryId
      ) {
        return {
          responseInfo: {
            statusCode: 400,
            message:
              "A subcategoria selecionada não pertence a esta categoria e tipo de formulário!",
          } as APIResponseInfo,
          data: null,
        };
      }

      await prisma.$transaction(async (tx) => {
        const subcategory = await tx.subcategory.create({
          data: {
            formUse: parse.formUse,
            name: parse.name,
            categoryId: parse.categoryId,
            notes: parse.notes ?? null,
            optional: sourceSubcategory.optional,
            active: sourceSubcategory.active,
            allowGeometryAssociation: parse.allowGeometryAssociation,
            geometryTypes: parse.geometryTypes,
          },
          select: { id: true },
        });

        const questionValues = sourceSubcategory.question.map((question) => {
          const geometryTypes =
            question.geometryTypes.length > 0 ?
              Prisma.sql`ARRAY[${Prisma.join(
                question.geometryTypes.map(
                  (geometryType) =>
                    Prisma.sql`${geometryType}::"QuestionGeometryTypes"`,
                ),
                ",",
              )}]`
            : Prisma.sql`ARRAY[]::"QuestionGeometryTypes"[]`;

          return Prisma.sql`(
            ${question.formUse}::"FORM_USE",
            ${question.name},
            ${question.iconKey},
            ${question.notes},
            ${question.isPublic},
            ${question.allowResponseImages},
            ${question.minValue},
            ${question.maxValue},
            ${question.questionType}::"question_types",
            ${question.characterType}::"question_response_character_types",
            ${question.optionType ? Prisma.sql`${question.optionType}::"option_types"` : Prisma.sql`NULL`},
            ${geometryTypes},
            ${parse.categoryId},
            ${subcategory.id},
            CURRENT_TIMESTAMP,
            CURRENT_TIMESTAMP
          )`;
        });

        if (questionValues.length === 0) return;

        const createdQuestions = await tx.$queryRaw<
          { id: number; name: string }[]
        >(Prisma.sql`
          INSERT INTO "question" (
            "form_use",
            "name",
            "icon_key",
            "notes",
            "is_public",
            "allow_response_images",
            "min_value",
            "max_value",
            "question_type",
            "character_type",
            "option_type",
            "geometry_types",
            "category_id",
            "subcategory_id",
            "created_at",
            "updated_at"
          )
          VALUES ${Prisma.join(questionValues, ",")}
          RETURNING "id", "name"
        `);

        const questionIdsByName = new Map(
          createdQuestions.map((question) => [question.name, question.id]),
        );
        const sourceQuestionIds = new Map<number, number>();

        sourceSubcategory.question.forEach((question) => {
          const newQuestionId = questionIdsByName.get(question.name);
          if (!newQuestionId) {
            throw new Error("Questão clonada não encontrada");
          }
          sourceQuestionIds.set(question.id, newQuestionId);
        });

        const optionValues = sourceSubcategory.question.flatMap((question) => {
          const questionId = sourceQuestionIds.get(question.id);
          if (!questionId) {
            throw new Error("Questão das opções clonadas não encontrada");
          }
          return question.options.map(
            (option) =>
              Prisma.sql`(${option.text}, ${questionId}, ${option.isOverridable}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
          );
        });

        if (optionValues.length > 0) {
          await tx.$executeRaw(Prisma.sql`
            INSERT INTO "option" (
              "text",
              "question_id",
              "is_overridable",
              "created_at",
              "updated_at"
            )
            VALUES ${Prisma.join(optionValues, ",")}
          `);
        }
      });

      return {
        responseInfo: {
          statusCode: 201,
          message: `Subcategoria ${parse.name} clonada!`,
        } as APIResponseInfo,
        data: null,
      };
    }

    if (parse.subcategoryId) {
      const subcategory = await prisma.subcategory.update({
        where: { id: parse.subcategoryId },
        data: {
          name: parse.name,
          notes: parse.notes ?? null,
          allowGeometryAssociation: parse.allowGeometryAssociation,
          geometryTypes: parse.geometryTypes,
        },
      });
      return {
        responseInfo: {
          statusCode: 201,
          message: `Subcategoria ${subcategory.name} editada!`,
        } as APIResponseInfo,
        data: null,
      };
    }
    const subcategory = await prisma.subcategory.create({
      data: {
        formUse: parse.formUse,
        name: parse.name,
        categoryId: parse.categoryId,
        notes: parse.notes ?? null,
        allowGeometryAssociation: parse.allowGeometryAssociation,
        geometryTypes: parse.geometryTypes,
      },
    });

    return {
      responseInfo: {
        statusCode: 201,
        message: `Subcategoria ${subcategory.name} criada!`,
      } as APIResponseInfo,
      data: null,
    };
  } catch (e) {
    if (e instanceof PrismaClientKnownRequestError)
      if (e.code === "P2002")
        return {
          responseInfo: {
            statusCode: 409,
            message: `Já existe uma subcategoria de nome ${(formData.get("subcategory-name") as string) ?? "inválido"}`,
          } as APIResponseInfo,
          data: null,
        };
    return {
      responseInfo: {
        statusCode: 500,
        message: "Erro ao criar subcategoria!",
      } as APIResponseInfo,
      data: null,
    };
  }
};

export {
  _categorySubmit,
  _subcategorySubmit,
  _deleteCategory,
  _deleteSubcategory,
};
