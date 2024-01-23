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

export { categorySubmit };
