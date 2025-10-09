"use server";

import {
  categoryInfoToCreateSchema,
  subcategoryInfoToCreateSchema,
} from "@/lib/zodValidators";
import { prisma } from "@lib/prisma";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { checkIfLoggedInUserHasAnyPermission } from "@serverOnly/checkPermission";
import { revalidateTag } from "next/cache";

import { APIResponseInfo } from "../../types/backendCalls/APIResponse";

const _categorySubmit = async (
  prevState: {
    responseInfo: APIResponseInfo | null;
    categoryName: string | null;
  },
  formData: FormData,
) => {
  try {
    await checkIfLoggedInUserHasAnyPermission({ roles: ["FORM_MANAGER"] });
  } catch (e) {
    return {
      responseInfo: {
        statusCode: 401,
        message: "Sem permissão para criar categorias!",
      } as APIResponseInfo,
      categoryName: null,
    };
  }
  let parse;
  try {
    parse = categoryInfoToCreateSchema.parse({
      name: formData.get("name"),
      notes: formData.get("notes"),
    });
  } catch (e) {
    return {
      responseInfo: {
        statusCode: 400,
        message: "Dados inválidos!",
      } as APIResponseInfo,
      categoryName: null,
    };
  }

  try {
    const category = await prisma.category.create({ data: parse });
    revalidateTag("category");
    return {
      responseInfo: {
        statusCode: 201,
        showSuccessCard: true,
        message: `Categoria ${category.name} criada!`,
      } as APIResponseInfo,
      categoryName: category.name,
    };
  } catch (e) {
    if (e instanceof PrismaClientKnownRequestError)
      if (e.code === "P2002")
        return {
          responseInfo: {
            statusCode: 409,
            message: `Já existe uma categoria de nome ${parse.name}`,
          } as APIResponseInfo,
          categoryName: parse.name,
        };
    return {
      responseInfo: {
        statusCode: 500,
        message: `Erro ao criar categoria!`,
      } as APIResponseInfo,
      categoryName: parse.name,
    };
  }
};

const _deleteCategory = async (
  prevState: {
    responseInfo: APIResponseInfo;
    formsWithQuestions: {
      name: string;
      formItems: {
        question: {
          id: number;
          name: string;
        } | null;
      }[];
    }[];
  } | null,
  formData: FormData,
): Promise<{
  responseInfo: APIResponseInfo;
  formsWithQuestions: {
    name: string;
    formItems: {
      question: {
        id: number;
        name: string;
      } | null;
    }[];
  }[];
} | null> => {
  try {
    await checkIfLoggedInUserHasAnyPermission({ roles: ["FORM_MANAGER"] });
  } catch (e) {
    return {
      responseInfo: {
        statusCode: 401,
        message: "Sem permissão para excluir categorias!",
      } as APIResponseInfo,
      formsWithQuestions: [],
    };
  }
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
        formsWithQuestions: formsWithQuestions,
      };
    }
  } catch (e) {
    return {
      responseInfo: { statusCode: 500, message: "Erro ao excluir categoria!" },
      formsWithQuestions: [],
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
        showSuccessCard: true,
        message: `Categoria "${deletedCategoryName}" excluída!`,
      },
      formsWithQuestions: [],
    };
  } catch (e) {
    return {
      responseInfo: { statusCode: 500, message: "Erro ao excluir categoria!" },
      formsWithQuestions: [],
    };
  }
};

const _deleteSubcategory = async (
  prevState: {
    responseInfo: APIResponseInfo;
    formsWithQuestions: {
      name: string;
      formItems: {
        question: {
          id: number;
          name: string;
        } | null;
      }[];
    }[];
  } | null,
  formData: FormData,
): Promise<{
  responseInfo: APIResponseInfo;
  formsWithQuestions: {
    name: string;
    formItems: {
      question: {
        id: number;
        name: string;
      } | null;
    }[];
  }[];
} | null> => {
  try {
    await checkIfLoggedInUserHasAnyPermission({ roles: ["FORM_MANAGER"] });
  } catch (e) {
    return {
      responseInfo: {
        statusCode: 401,
        message: "Sem permissão para excluir subcategorias!",
      } as APIResponseInfo,
      formsWithQuestions: [],
    };
  }
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
        formsWithQuestions: formsWithQuestions,
      };
    }
  } catch (e) {
    return {
      responseInfo: { statusCode: 500, message: "Erro ao excluir categoria!" },
      formsWithQuestions: [],
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
        showSuccessCard: true,
        message: `Subcategoria "${deletedSubcategoryName}" excluída!`,
      },
      formsWithQuestions: [],
    };
  } catch (e) {
    return {
      responseInfo: {
        statusCode: 500,
        message: "Erro ao excluir subcategoria!",
      },
      formsWithQuestions: [],
    };
  }
};

const _subcategorySubmit = async (
  prevState: { responseInfo: APIResponseInfo; subcategoryName: string | null },
  formData: FormData,
) => {
  try {
    await checkIfLoggedInUserHasAnyPermission({ roles: ["FORM_MANAGER"] });
  } catch (e) {
    return {
      responseInfo: {
        statusCode: 401,
        message: "Sem permissão para criar categorias!",
      } as APIResponseInfo,
      subcategoryName: null,
    };
  }

  try {
    const parsedSubcategoryInfo = subcategoryInfoToCreateSchema.parse({
      name: formData.get("subcategory-name"),
      categoryId: formData.get("category-id"),
      notes: formData.get("notes"),
    });
    const subcategory = await prisma.subcategory.create({
      data: parsedSubcategoryInfo,
    });
    revalidateTag("subcategory");

    return {
      responseInfo: {
        statusCode: 201,
        showSuccessCard: true,
        message: `Subcategoria ${subcategory.name} criada!`,
      } as APIResponseInfo,
      subcategoryName: subcategory.name,
    };
  } catch (e) {
    if (e instanceof PrismaClientKnownRequestError)
      if (e.code === "P2002")
        return {
          responseInfo: {
            statusCode: 409,
            message: `Já existe uma subcategoria de nome ${(formData.get("subcategory-name") as string) ?? "inválido"}`,
          } as APIResponseInfo,
          subcategoryName: null,
        };
    return {
      responseInfo: {
        statusCode: 500,
        message: "Erro ao criar subcategoria!",
      } as APIResponseInfo,
      subcategoryName: null,
    };
  }
};

export {
  _categorySubmit,
  _subcategorySubmit,
  _deleteCategory,
  _deleteSubcategory,
};
