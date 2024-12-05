"use server";

import { prisma } from "@/lib/prisma";
import { categorySchema } from "@/lib/zodValidators";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { revalidatePath, revalidateTag } from "next/cache";

type CategoriesWithQuestions = NonNullable<
  Awaited<ReturnType<typeof getCategories>>
>;

const categorySubmit = async (
  prevState: { statusCode: number; categoryName: string | null },
  formData: FormData,
) => {
  let parse;
  try {
    parse = categorySchema.parse({
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
      questions: { id: number; name: string }[];
    }[];
    categoryName: string | null;
  };
} | null> => {
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

const subcategorySubmit = async (
  prevState: { statusCode: number; subcategoryName: string | null },
  formData: FormData,
) => {
  const categoryId = formData.get("category-id") as string;
  const subcategoryName = formData.get("subcategory-name") as string;
  try {
    const subcategory = await prisma.subcategory.create({
      data: {
        name: subcategoryName,
        category: {
          connect: {
            id: Number(categoryId),
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
  const categories = await prisma.category.findMany({
    select: {
      id: true,
      name: true,
      subcategory: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });
  return categories;
};
export { categorySubmit, subcategorySubmit, getCategories, deleteCategory };
export { type CategoriesWithQuestions };
