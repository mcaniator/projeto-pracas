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
export { categorySubmit, subcategorySubmit, getCategories };
export { type CategoriesWithQuestions };
