"use server";

import { prisma } from "@/lib/prisma";
import { formSchema } from "@/lib/zodValidators";
import { revalidateTag } from "next/cache";

const formSubmit = async (
  prevState: { message: string },
  formData: FormData,
) => {
  let parse;
  try {
    parse = formSchema.parse({
      name: formData.get("name"),
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
