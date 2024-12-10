"use server";

import { prisma } from "@/lib/prisma";
import { formSchema } from "@/lib/zodValidators";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { revalidateTag } from "next/cache";

const formSubmit = async (
  prevState: { statusCode: number; formName: string | null } | null,
  formData: FormData,
): Promise<{ statusCode: number; formName: string | null } | null> => {
  let parse;
  try {
    parse = formSchema.parse({
      name: formData.get("name"),
    });
  } catch (e) {
    return {
      statusCode: 400,
      formName: null,
    };
  }

  try {
    const createdForm = await prisma.form.create({ data: parse });
    revalidateTag("form");
    return { statusCode: 201, formName: createdForm.name };
  } catch (e) {
    if (e instanceof PrismaClientKnownRequestError)
      if (e.code === "P2002") return { statusCode: 409, formName: null };
    return {
      statusCode: 500,
      formName: null,
    };
  }
};

export { formSubmit };
