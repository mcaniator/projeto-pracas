"use server";

import {
  DisplayCalculation,
  DisplayQuestion,
} from "@/app/admin/forms/[formId]/edit/client";
import { prisma } from "@/lib/prisma";
import { formSchema } from "@/lib/zodValidators";
import { Form, Prisma } from "@prisma/client";
import { revalidatePath, revalidateTag, unstable_cache } from "next/cache";
import { z } from "zod";

import { QuestionWithCategories } from "./questionSubmit";

interface FormToEditPage {
  id: number;
  name: string;
  version: number;
  questions: QuestionWithCategories[];
  calculations: DisplayCalculation[];
}

const handleDelete = async (formID: number) => {
  try {
    await prisma.form.delete({
      where: {
        id: formID,
      },
    });
    revalidatePath("/admin/forms");
  } catch (error) {
    throw new Error(`Erro ao excluir o formulário:${formID}`);
  }
};

const fetchForms = async () => {
  let forms: Form[];

  try {
    forms = await prisma.form.findMany({
      where: {
        version: {
          not: 0,
        },
      },
      select: {
        id: true,
        name: true,
        version: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  } catch (e) {
    forms = [];
  }
  return forms;
};

const fetchFormsLatest = async () => {
  let forms: Form[];
  try {
    forms = await prisma.form.findMany({
      select: {
        id: true,
        name: true,
        version: true,
        createdAt: true,
        updatedAt: true,
      },
      distinct: ["name"],
      orderBy: [
        {
          name: "asc",
        },
        {
          version: "desc",
        },
      ],
    });
  } catch (e) {
    forms = [];
  }
  return forms;
};

const searchFormById = async (id: number) => {
  const cachedForm = unstable_cache(
    async (id: number): Promise<FormToEditPage | undefined | null> => {
      let foundForm;
      try {
        foundForm = await prisma.form.findUnique({
          where: {
            id: id,
          },
          select: {
            id: true,
            name: true,
            version: true,
            questions: {
              include: {
                category: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
                subcategory: {
                  select: {
                    id: true,
                    name: true,
                    categoryId: true,
                  },
                },
              },
            },
            calculations: {
              include: {
                category: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
                subcategory: {
                  select: {
                    id: true,
                    name: true,
                    categoryId: true,
                  },
                },
                questions: true,
              },
            },
          },
        });
      } catch (err) {
        return null;
      }

      return foundForm;
    },
    ["searchLocationsByIdCache"],
    { tags: ["location", "form", "question"] },
  );

  return await cachedForm(id);
};

const searchformNameById = async (formId: number) => {
  const formName = await prisma.form.findUnique({
    where: {
      id: formId,
    },
    select: {
      name: true,
    },
  });
  return formName?.name;
};

const updateForm = async (
  prevState: { statusCode: number },
  formData: FormData,
) => {
  let parseId;
  try {
    parseId = z.coerce
      .number()
      .int()
      .finite()
      .nonnegative()
      .parse(formData.get("formId"));
  } catch (e) {
    return {
      statusCode: 1,
    };
  }

  let formToUpdate;
  try {
    formToUpdate = formSchema.parse({
      name: formData.get("name"),
    });
  } catch (e) {
    return {
      statusCode: 1,
    };
  }

  try {
    await prisma.form.update({
      where: { id: parseId },
      data: formToUpdate,
    });
  } catch (e) {
    return {
      statusCode: 2,
    };
  }

  revalidateTag("form");
  return {
    statusCode: 0,
  };
};

const createVersion = async (
  formId: number,
  questions: DisplayQuestion[],
  calculationsToCreate: DisplayCalculation[],
) => {
  const formType = Prisma.validator<Prisma.FormDefaultArgs>()({
    select: { id: true, name: true, version: true },
  });
  let form: Prisma.FormGetPayload<typeof formType> | null = null;
  let newFormId: number | null = null;

  try {
    form = await prisma.form.findUnique({
      where: {
        id: formId,
      },
    });
  } catch (error) {
    throw new Error(`Erro ao recuperar formulários`);
  }

  if (form === null) return { message: "erro do servidor" };

  try {
    const newForm = await prisma.form.create({
      data: {
        name: form.name,
        version: form.version + 1,
        questions: {
          connect: questions.map((question) => ({ id: question.id })),
        },
        calculations: {
          create: calculationsToCreate.map((calculation) => ({
            type: calculation.type,
            name: calculation.name,
            questions: {
              connect: calculation.questions.map((q) => ({ id: q.id })),
            },
            category: { connect: { id: calculation.category.id } },
            ...(calculation.subcategory ?
              { subcategory: { connect: { id: calculation.subcategory.id } } }
            : {}),
          })),
        },
      },
    });

    newFormId = newForm.id;
  } catch (e) {
    return {
      message: "erro do servidor",
    };
  }

  revalidateTag("questionOnForm");
  return { statusCode: 0, newFormId };
};

export {
  fetchForms,
  handleDelete,
  searchFormById,
  searchformNameById,
  updateForm,
  createVersion,
  fetchFormsLatest,
};
export { type FormToEditPage };
