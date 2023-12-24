"use server";

import { prisma } from "@/lib/prisma";
import { revalidateTag } from "next/cache";
import { z } from "zod";

const categorySchema = z.object({
  name: z.string().min(1),
  optional: z.boolean().optional(),
  active: z.boolean().optional(),
});

const categorySubmit = async (prevState: { statusCode: number }, formData: FormData) => {
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
