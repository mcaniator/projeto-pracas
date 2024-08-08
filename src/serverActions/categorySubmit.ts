"use server";

import { prisma } from "@/lib/prisma";
import { categorySchema } from "@/lib/zodValidators";
import { revalidateTag } from "next/cache";

const categorySubmit = async (
  prevState: { statusCode: number },
  formData: FormData,
) => {
  let parse;
  try {
    parse = categorySchema.parse({
      name: formData.get("name"),
    });
  } catch (e) {
    return {
      statusCode: 1,
    };
  }

  try {
    await prisma.category.create({ data: parse });
  } catch (e) {
    return {
      statusCode: 2,
    };
  }

  revalidateTag("category");
  return {
    statusCode: 0,
  };
};

const subcategorySubmit = async (
  prevState: { statusCode: number },
  formData: FormData,
) => {
  const categoryId = formData.get("category-id") as string;
  const subcategoryName = formData.get("subcategory-name") as string;
  try {
    await prisma.subcategory.create({
      data: {
        name: subcategoryName,
        category: {
          connect: {
            id: Number(categoryId),
          },
        },
      },
    });
  } catch (e) {
    return {
      statusCode: 2,
    };
  }
  revalidateTag("category");
  return { statusCode: 0 };
};

export { categorySubmit, subcategorySubmit };
