"use server";

import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";

const handleDelete = async (formID: number) => {
  try {
    await prisma.form.delete({
      where: {
        id: formID,
      },
    });
    revalidatePath("/admin/forms");
  } catch (error) {
    // an error logging service would go here!
    throw new Error(`Erro ao excluir o formulário:${formID}`);
  }
};

const fetchForms = async () => {
  const formsType = Prisma.validator<Prisma.FormDefaultArgs>()({
    select: { id: true, name: true },
  });

  let forms: Prisma.FormGetPayload<typeof formsType>[] = [];

  try {
    forms = await prisma.form.findMany({
      select: {
        id: true,
        name: true,
      },
    });
  } catch (error) {
    // an error logging service would go here!
    throw new Error(`Erro ao recuperar formulários`);
  }

  return forms;
};

export { fetchForms, handleDelete };
