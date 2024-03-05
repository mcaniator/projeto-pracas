"use server";

import { prisma } from "@/lib/prisma";
import { Form, Prisma } from "@prisma/client";
import { revalidatePath, unstable_cache } from "next/cache";

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
    console.error(`Erro ao recuperar formulários`, error);
  }

  return forms;
};

const searchFormsById = async (id: number) => {
  const cachedForms = unstable_cache(
    async (id: number): Promise<Form | undefined | null> => {
      let foundForm;
      try {
        foundForm = await prisma.form.findUnique({
          where: {
            id: id,
          },
        });
      } catch (err) {
        // console.error(err);
      }

      return foundForm;
    },
    ["searchLocationsByIdCache"],
    { tags: ["location"] },
  );

  return await cachedForms(id);
};

export { fetchForms, handleDelete, searchFormsById };
