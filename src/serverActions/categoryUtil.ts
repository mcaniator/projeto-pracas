"use server";

import {
  categoryInfoToCreateSchema,
  subcategoryInfoToCreateSchema,
} from "@/lib/zodValidators";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { revalidatePath, revalidateTag } from "next/cache";

import PermissionError from "../errors/permissionError";
import { prisma } from "../lib/prisma";
import { checkIfLoggedInUserHasAnyPermission } from "../serverOnly/checkPermission";

type FetchedCategories = NonNullable<
  Awaited<ReturnType<typeof fetchCategories>>
>["categories"];

type CategoriesWithQuestionsAndStatusCode = NonNullable<
  Awaited<ReturnType<typeof getCategories>>
>;

type CategoriesWithQuestions = NonNullable<
  Awaited<ReturnType<typeof getCategories>>["categories"]
>;

const fetchCategories = async () => {
  try {
    await checkIfLoggedInUserHasAnyPermission({ roleGroups: ["FORM"] });
    const categories = await prisma.category.findMany({
      include: {
        subcategory: true,
      },
      orderBy: {
        name: "asc",
      },
    });
    return { statusCode: 200, categories };
  } catch (e) {
    if (e instanceof PermissionError) {
      return { statusCode: 401, categories: null };
    }
    return { statusCode: 500, categories: null };
  }
};

const categorySubmit = async (
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

const deleteCategory = async (
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

const deleteSubcategory = async (
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

const subcategorySubmit = async (
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
  const categoryId = formData.get("category-id") as string;
  const subcategoryName = formData.get("subcategory-name") as string;
  try {
    const parsedSubcategoryInfo = subcategoryInfoToCreateSchema.parse({
      name: subcategoryName,
      categoryId: categoryId,
    });
    const subcategory = await prisma.subcategory.create({
      data: {
        name: parsedSubcategoryInfo.name,
        category: {
          connect: {
            id: parsedSubcategoryInfo.categoryId,
          },
        },
      },
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

const getCategories = async () => {
  try {
    await checkIfLoggedInUserHasAnyPermission({ roles: ["FORM_MANAGER"] });
  } catch (e) {
    return { statusCode: 401, categories: [] };
  }
  try {
    const categories = await prisma.category.findMany({
      select: {
        id: true,
        name: true,
        subcategory: {
          select: {
            id: true,
            name: true,
          },
          orderBy: {
            name: "asc",
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });
    return { statusCode: 200, categories: categories };
  } catch (e) {
    return { statusCode: 500, categories: [] };
  }
};

export {
  fetchCategories,
  categorySubmit,
  subcategorySubmit,
  getCategories,
  deleteCategory,
  deleteSubcategory,
};
export type {
  FetchedCategories,
  CategoriesWithQuestions,
  CategoriesWithQuestionsAndStatusCode,
};
