"use server";

import {
  categoryInfoToCreateSchema,
  subcategoryInfoToCreateSchema,
} from "@/lib/zodValidators";
import { prisma } from "@lib/prisma";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { checkIfLoggedInUserHasAnyPermission } from "@serverOnly/checkPermission";
import { revalidatePath, revalidateTag } from "next/cache";

const _categorySubmit = async (
  prevState: { statusCode: number; categoryName: string | null },
  formData: FormData,
) => {
  try {
    await checkIfLoggedInUserHasAnyPermission({ roles: ["FORM_MANAGER"] });
  } catch (e) {
    return {
      statusCode: 401,
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
      statusCode: 400,
      categoryName: null,
    };
  }

  try {
    const category = await prisma.category.create({ data: parse });
    revalidateTag("category");
    return { statusCode: 201, categoryName: category.name };
  } catch (e) {
    if (e instanceof PrismaClientKnownRequestError)
      if (e.code === "P2002") return { statusCode: 409, categoryName: null };
    return {
      statusCode: 500,
      categoryName: null,
    };
  }
};

const _deleteCategory = async (
  prevState: {
    statusCode: number;
    content: {
      formsWithQuestions: {
        id: number;
        name: string;
        questions: { id: number; name: string }[];
      }[];
      categoryName: string | null;
    };
  } | null,
  formData: FormData,
): Promise<{
  statusCode: number;
  content: {
    formsWithQuestions: {
      id: number;
      name: string;
      version: number;
      questions: { id: number; name: string }[];
    }[];
    categoryName: string | null;
  };
} | null> => {
  try {
    await checkIfLoggedInUserHasAnyPermission({ roles: ["FORM_MANAGER"] });
  } catch (e) {
    return {
      statusCode: 401,
      content: { formsWithQuestions: [], categoryName: null },
    };
  }
  const categoryId = parseInt(formData.get("categoryId") as string);
  try {
    const questionsInForms = await prisma.question.findMany({
      where: {
        categoryId: categoryId,
        forms: {
          some: {},
        },
      },
      select: {
        id: true,
        name: true,
        forms: {
          select: {
            id: true,
            name: true,
            version: true,
          },
        },
      },
    });
    const formsWithQuestions = questionsInForms.reduce(
      (acc, question) => {
        question.forms.forEach((form) => {
          let formEntry = acc.find((f) => f.id === form.id);

          if (!formEntry) {
            formEntry = {
              id: form.id,
              name: form.name,
              version: form.version,
              questions: [],
            };
            acc.push(formEntry);
          }

          formEntry.questions.push({
            id: question.id,
            name: question.name,
          });
        });
        return acc;
      },
      [] as {
        id: number;
        name: string;
        version: number;
        questions: { id: number; name: string }[];
      }[],
    );
    if (questionsInForms.length > 0) {
      return {
        statusCode: 409,
        content: { formsWithQuestions: formsWithQuestions, categoryName: null },
      };
    }
  } catch (e) {
    return {
      statusCode: 500,
      content: { formsWithQuestions: [], categoryName: null },
    };
  }
  try {
    const deletedCategory = await prisma.category.delete({
      where: {
        id: categoryId,
      },
    });
    return {
      statusCode: 200,
      content: { formsWithQuestions: [], categoryName: deletedCategory.name },
    };
  } catch (e) {
    return {
      statusCode: 500,
      content: { formsWithQuestions: [], categoryName: null },
    };
  }
};

const _deleteSubcategory = async (
  prevState: {
    statusCode: number;
    content: {
      formsWithQuestions: {
        id: number;
        name: string;
        questions: { id: number; name: string }[];
      }[];
      subcategoryName: string | null;
    };
  } | null,
  formData: FormData,
): Promise<{
  statusCode: number;
  content: {
    formsWithQuestions: {
      id: number;
      name: string;
      version: number;
      questions: { id: number; name: string }[];
    }[];
    subcategoryName: string | null;
  };
} | null> => {
  try {
    await checkIfLoggedInUserHasAnyPermission({ roles: ["FORM_MANAGER"] });
  } catch (e) {
    return {
      statusCode: 401,
      content: { formsWithQuestions: [], subcategoryName: null },
    };
  }
  const subcategoryId = parseInt(formData.get("subcategoryId") as string);
  try {
    const questionsInForms = await prisma.question.findMany({
      where: {
        subcategoryId: subcategoryId,
        forms: {
          some: {},
        },
      },
      select: {
        id: true,
        name: true,
        forms: {
          select: {
            id: true,
            name: true,
            version: true,
          },
        },
      },
    });
    const formsWithQuestions = questionsInForms.reduce(
      (acc, question) => {
        question.forms.forEach((form) => {
          let formEntry = acc.find((f) => f.id === form.id);

          if (!formEntry) {
            formEntry = {
              id: form.id,
              name: form.name,
              version: form.version,
              questions: [],
            };
            acc.push(formEntry);
          }

          formEntry.questions.push({
            id: question.id,
            name: question.name,
          });
        });
        return acc;
      },
      [] as {
        id: number;
        name: string;
        version: number;
        questions: { id: number; name: string }[];
      }[],
    );
    if (questionsInForms.length > 0) {
      return {
        statusCode: 409,
        content: {
          formsWithQuestions: formsWithQuestions,
          subcategoryName: null,
        },
      };
    }
  } catch (e) {
    return {
      statusCode: 500,
      content: { formsWithQuestions: [], subcategoryName: null },
    };
  }
  try {
    const deletedSubcategory = await prisma.subcategory.delete({
      where: {
        id: subcategoryId,
      },
    });
    return {
      statusCode: 200,
      content: {
        formsWithQuestions: [],
        subcategoryName: deletedSubcategory.name,
      },
    };
  } catch (e) {
    return {
      statusCode: 500,
      content: { formsWithQuestions: [], subcategoryName: null },
    };
  }
};

const _subcategorySubmit = async (
  prevState: { statusCode: number; subcategoryName: string | null },
  formData: FormData,
) => {
  try {
    await checkIfLoggedInUserHasAnyPermission({ roles: ["FORM_MANAGER"] });
  } catch (e) {
    return {
      statusCode: 401,
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
    revalidateTag("question");
    revalidatePath("/");
    return { statusCode: 201, subcategoryName: subcategory.name };
  } catch (e) {
    if (e instanceof PrismaClientKnownRequestError)
      if (e.code === "P2002") return { statusCode: 409, subcategoryName: null };
    return {
      statusCode: 500,
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
