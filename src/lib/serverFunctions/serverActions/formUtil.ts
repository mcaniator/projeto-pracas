"use server";

import { prisma } from "@/lib/prisma";
import { formSchema } from "@/lib/zodValidators";
import { FormCalculation, FormQuestion } from "@customTypes/forms/formCreation";
import { Prisma } from "@prisma/client";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { checkIfLoggedInUserHasAnyPermission } from "@serverOnly/checkPermission";
import { revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

const _formSubmit = async (
  prevState: { statusCode: number; formName: string | null } | null,
  formData: FormData,
): Promise<{ statusCode: number; formName: string | null } | null> => {
  let parse;
  try {
    await checkIfLoggedInUserHasAnyPermission({ roles: ["FORM_MANAGER"] });
  } catch (e) {
    return {
      statusCode: 401,
      formName: null,
    };
  }
  try {
    console.log(formData);
    parse = formSchema.parse({
      name: formData.get("name"),
      cloneFormId: formData.get("cloneFormId"),
    });
  } catch (e) {
    return {
      statusCode: 400,
      formName: null,
    };
  }

  try {
    if (parse.cloneFormId) {
      const formToBeCloned = await prisma.form.findUnique({
        where: {
          id: parse.cloneFormId,
        },
        select: {
          calculations: {
            include: {
              questions: true,
              targetQuestion: true,
            },
          },
          formCategories: true,
          formSubcategories: true,
          formQuestion: true,
        },
      });
      if (!formToBeCloned) {
        throw new Error("Form not found");
      }
      //TODO
      throw new Error("Not implemented");
    }
    const createdForm = await prisma.form.create({
      data: { name: parse.name },
    });
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

const _deleteFormVersion = async (
  prevState: {
    statusCode: number;
    content: {
      assessmentsWithForm: {
        id: number;
        startDate: Date;
        location: {
          name: string;
          id: number;
        };
        user: {
          username: string | null;
        };
      }[];
      form: { name: string; version: number } | null;
    };
  } | null,
  formData: FormData,
): Promise<{
  statusCode: number;
  content: {
    assessmentsWithForm: {
      id: number;
      startDate: Date;
      location: {
        name: string;
        id: number;
      };
      user: {
        username: string | null;
      };
    }[];
    form: { name: string; version: number } | null;
  };
} | null> => {
  try {
    await checkIfLoggedInUserHasAnyPermission({ roles: ["FORM_MANAGER"] });
  } catch (e) {
    return {
      statusCode: 401,
      content: { assessmentsWithForm: [], form: null },
    };
  }
  const formId = parseInt(formData.get("formId") as string);
  try {
    const assessments = await prisma.assessment.findMany({
      where: {
        formId,
      },
      select: {
        id: true,
        startDate: true,
        location: {
          select: {
            id: true,
            name: true,
          },
        },
        user: {
          select: {
            username: true,
          },
        },
      },
    });
    if (assessments.length > 0) {
      return {
        statusCode: 409,
        content: { form: null, assessmentsWithForm: assessments },
      };
    }
    const form = await prisma.form.delete({
      where: {
        id: formId,
      },
      select: {
        name: true,
        version: true,
      },
    });
    return {
      statusCode: 200,
      content: { form, assessmentsWithForm: [] },
    };
  } catch (error) {
    return {
      statusCode: 500,
      content: { form: null, assessmentsWithForm: [] },
    };
  }
};

const _updateForm = async (
  prevState: { statusCode: number },
  formData: FormData,
) => {
  try {
    await checkIfLoggedInUserHasAnyPermission({ roles: ["FORM_MANAGER"] });
  } catch (e) {
    return { statusCode: 401 };
  }
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
      statusCode: 400,
    };
  }

  let formToUpdate;
  try {
    formToUpdate = formSchema.parse({
      name: formData.get("name"),
    });
  } catch (e) {
    return {
      statusCode: 400,
    };
  }

  try {
    await prisma.form.update({
      where: { id: parseId },
      data: formToUpdate,
    });
    revalidateTag("form");
    return {
      statusCode: 200,
    };
  } catch (e) {
    if (
      e instanceof Prisma.PrismaClientKnownRequestError &&
      e.code === "P2002"
    ) {
      return {
        statusCode: 409,
      };
    }
    return {
      statusCode: 500,
    };
  }
};

const _updateFormV2 = async ({
  formId,
  formQuestionsToUpdate,
  formQuestionsToRemove,
  questionsToAdd,
  newFormName,
  oldFormName,
}: {
  formId: number;
  formQuestionsToUpdate: { id: number; position: number }[];
  formQuestionsToRemove: { id: number }[];
  questionsToAdd: { id: number }[];
  newFormName?: string;
  oldFormName: string;
}) => {
  try {
    await checkIfLoggedInUserHasAnyPermission({ roles: ["FORM_MANAGER"] });
  } catch (e) {
    return { statusCode: 401 };
  }
  try {
    if (newFormName !== oldFormName) {
      await prisma.form.update({
        data: { name: newFormName },
        where: { id: formId },
      });
    }
    revalidateTag("form");
    return { statusCode: 200 };
  } catch (e) {
    console.log(e);
    return { statusCode: 500 };
  }
};

const _createVersion = async (
  formId: number,
  questions: FormQuestion[],
  calculationsToCreate: FormCalculation[],
) => {
  try {
    await checkIfLoggedInUserHasAnyPermission({ roles: ["FORM_MANAGER"] });
  } catch (e) {
    return { statusCode: 401 };
  }
  const formType = Prisma.validator<Prisma.FormDefaultArgs>()({
    select: { id: true, name: true, version: true },
  });
  let form: Prisma.FormGetPayload<typeof formType> | null = null;

  try {
    form = await prisma.form.findUnique({
      where: {
        id: formId,
      },
    });
  } catch (error) {
    return { statusCode: 500 };
  }

  if (form === null) return { statusCode: 404 };

  try {
    await prisma.form.create({
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
  } catch (e) {
    return {
      statusCode: 500,
    };
  }

  revalidateTag("questionOnForm");
  redirect("/admin/registration/forms?formCreated=true");
  return { statusCode: 201 };
};

export {
  _formSubmit,
  _deleteFormVersion,
  _updateForm,
  _createVersion,
  _updateFormV2,
};
