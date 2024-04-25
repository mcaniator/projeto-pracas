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
    // console.error(`Erro ao excluir o formulário:${formID}`, error);
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
    // console.error(`Erro ao recuperar formulários`, error);
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
    // console.log(e);
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
    // console.log(err);
    return { statusCode: 2 };
  }

  revalidateTag("questionOnForm");
  return {
    statusCode: 0,
  };
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
    // console.log(err);
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
};
