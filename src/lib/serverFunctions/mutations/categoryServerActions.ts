import {
  categoryInfoToCreateSchema,
  subcategoryInfoToCreateSchema,
} from "@/lib/zodValidators";
import { prisma } from "@lib/prisma";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { z } from "zod";

import { APIResponseInfo } from "../../types/backendCalls/APIResponse";

export const categorySubmitDataSchema = z.instanceof(FormData);
export type CategorySubmitData = z.infer<typeof categorySubmitDataSchema>;

const _categorySubmit = async (formData: CategorySubmitData) => {
  let parse;
  try {
    parse = categoryInfoToCreateSchema.parse({
      name: formData.get("name"),
      notes: formData.get("notes"),
      categoryId: formData.get("categoryId"),
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
    if (parse.categoryId) {
      const category = await prisma.category.update({
        where: { id: parse.categoryId },
        data: { name: parse.name, notes: parse.notes },
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
      data: { name: parse.name, notes: parse.notes },
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
  formData: DeleteCategoryData,
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
  formData: DeleteSubcategoryData,
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

const _subcategorySubmit = async (formData: SubcategorySubmitData) => {
  let parse;
  try {
    parse = subcategoryInfoToCreateSchema.parse({
      name: formData.get("subcategory-name"),
      categoryId: formData.get("category-id"),
      notes: formData.get("notes"),
      subcategoryId: formData.get("subcategoryId"),
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
    if (parse.subcategoryId) {
      const subcategory = await prisma.subcategory.update({
        where: { id: parse.subcategoryId },
        data: { name: parse.name, notes: parse.notes ?? null },
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
        name: parse.name,
        categoryId: parse.categoryId,
        notes: parse.notes ?? null,
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
