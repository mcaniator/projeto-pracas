"use server";

import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const categorySchema = z.object({
  name: z.string().min(1),
  optional: z.boolean(),
  active: z.boolean(),
});

const categorySubmit = async (prevState: any, formData: FormData) => {
  const prisma = new PrismaClient();

  let parse;
  try {
    parse = categorySchema.parse({
      name: formData.get("name"),
      optional: false,
      active: true,
    });
  } catch (e) {
    return {
      message: "erro de tipagem",
    };
  }

  try {
    const categories = await prisma.category.create({ data: parse });
  } catch (e) {
    return {
      message: "erro do servidor",
    };
  }

  prisma.$disconnect();
  revalidatePath("/admin/registration/components");
  return {
    message: "nenhum erro",
  };
};

export { categorySubmit };
