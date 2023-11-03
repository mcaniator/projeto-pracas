"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const categorySchema = z.object({
  name: z.string().min(1),
  optional: z.boolean(),
  active: z.boolean(),
});

const categorySubmit = async (prevState: any, formData: FormData) => {
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

  revalidatePath("/admin/registration/questions");
  return {
    message: "nenhum erro",
  };
};

export { categorySubmit };
