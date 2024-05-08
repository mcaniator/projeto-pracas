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
    // console.error(`Erro ao recuperar formulários`, error); //1
  }

  if (form === null) return { message: "erro do servidor" };

  try {
    const newForm = await prisma.form.create({
      data: {
        name: form.name,
        version: form.version + 1,
      },
    });

    // Armazenar o ID do novo formulário
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
    // console.log(err); //2
    return { statusCode: 2 };
  }

  // const questionType = Prisma.validator<Prisma.QuestionsOnFormsDefaultArgs>()({
  //   select: { id: true, formId: true, questionId: true },
  // });

  // let oldQuestions:
  //   | Prisma.QuestionsOnFormsGetPayload<typeof questionType>[]
  //   | null = null;
  // try {
  //   oldQuestions = await prisma.questionsOnForms.findMany({
  //     where: {
  //       formId: formId,
  //     },
  //   });
  // } catch (err) {
  //   // console.error(err); //3
  // }
  // if (oldQuestions === null) return { message: "erro do servidor" };
  // try {
  //   const createManyParams = oldQuestions.map((question) => ({
  //     formId: newFormId,
  //     questionId: question.id,
  //   }));

  //   await prisma.questionsOnForms.createMany({
  //     data: createManyParams,
  //   });
  // } catch (err) {
  //   // console.log(err); //4
  //   return { statusCode: 2 };
  // }

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
  removeQuestions,
  createVersion,
};
