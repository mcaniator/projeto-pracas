"use server";

import { DisplayQuestion } from "@/app/admin/forms/[formId]/edit/client";
import { prisma } from "@/lib/prisma";
import { formSchema } from "@/lib/zodValidators";
import { Form, Prisma } from "@prisma/client";
import { revalidatePath, revalidateTag, unstable_cache } from "next/cache";
import { z } from "zod";

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
        return null;
      }

      return foundForm;
    },
    ["searchLocationsByIdCache"],
    { tags: ["location", "form"] },
  );

  return await cachedForms(id);
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

const addQuestion = async (formId: number, questionId: number) => {
  try {
    await prisma.questionsOnForms.create({
      data: { formId: formId, questionId: questionId },
    });
  } catch (err) {
    return { statusCode: 2 };
  }

  revalidateTag("questionOnForm");
  return {
    statusCode: 0,
  };
};

const createVersion = async (formId: number, questions: DisplayQuestion[]) => {
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
    // an error logging service would go here!
    throw new Error(`Erro ao recuperar formulários`); //1
  }

  if (form === null) return { message: "erro do servidor" };

  try {
    const newForm = await prisma.form.create({
      data: {
        name: form.name,
        version: form.version + 1,
      },
    });

    newFormId = newForm.id;
  } catch (e) {
    return {
      message: "erro do servidor",
    };
  }

  try {
    const createManyParams = questions.map((question) => ({
      formId: newFormId,
      questionId: question.id,
    }));

    await prisma.questionsOnForms.createMany({
      data: createManyParams,
    });
  } catch (err) {
    return { statusCode: 2 };
  }

  revalidateTag("questionOnForm");
  return { statusCode: 0, newFormId };
};

const addQuestions = async (formId: number, questions: DisplayQuestion[]) => {
  try {
    const createManyParams = questions.map((question) => ({
      formId: formId,
      questionId: question.id,
    }));

    await prisma.questionsOnForms.createMany({
      data: createManyParams,
    });
  } catch (err) {
    return { statusCode: 2 };
  }

  revalidateTag("questionOnForm");
  return {
    statusCode: 0,
  };
};

const removeQuestions = async (
  formId: number,
  questionIds: DisplayQuestion[],
) => {
  const questionsIds = questionIds.map((question) => question.id);
  try {
    await prisma.questionsOnForms.deleteMany({
      where: {
        formId: formId,
        questionId: { in: questionsIds },
      },
    });
  } catch (err) {
    return { statusCode: 2 };
  }

  revalidateTag("questionOnForm");
  return {
    statusCode: 0,
  };
};

export {
  fetchForms,
  handleDelete,
  searchFormsById,
  updateForm,
  addQuestion,
  addQuestions,
  removeQuestions,
  createVersion,
  fetchFormsLatest,
};
