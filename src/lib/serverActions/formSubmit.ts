"use server";

import { prisma } from "@/lib/prisma";
import { revalidateTag } from "next/cache";
import { z } from "zod";

const formSchema = z.object({
  nome: z.string().min(1),
});

const formSubmit = async (prevState: { message: string }, formData: FormData) => {
  let parse;
  try {
    parse = formSchema.parse({
      nome: formData.get("name"),
    });
  } catch (e) {
    return {
      message: "erro de tipagem",
    };
  }

  try {
    await prisma.form.create({ data: parse });
  } catch (e) {
    return {
      message: "erro do servidor",
    };
  }

  revalidateTag("form");
  return {
    message: "nenhum erro",
  };
};

export { formSubmit };
