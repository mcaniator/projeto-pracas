"use server";

import { prisma } from "@/lib/prisma";
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
    console.error(`Erro ao excluir o formulário:${formID}`, error);
  }
};

const fetchForms = async () => {
  let forms;
  try {
    forms = await prisma.form.findMany({
      select: {
        id: true,
        nome: true,
      },
    });
    return forms;
  } catch (error) {
    console.error(`Erro ao recuperar formulários`, error);
    forms = [];
  }
};

export { handleDelete, fetchForms };
