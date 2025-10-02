"use server";

import { prisma } from "@/lib/prisma";
import { formSchema } from "@/lib/zodValidators";
import { FormCalculation } from "@customTypes/forms/formCreation";
import { Prisma } from "@prisma/client";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { checkIfLoggedInUserHasAnyPermission } from "@serverOnly/checkPermission";
import { revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { CalculationParams } from "../../../app/admin/registration/forms/[formId]/edit/calculationDialog";
import { FormEditorTree } from "../../../app/admin/registration/forms/[formId]/edit/clientV2";
import { FormItemUtils } from "../../utils/formTreeUtils";

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
  formTree,
  calculations,
  newFormName,
  oldFormName,
}: {
  formId: number;
  formTree: FormEditorTree;
  calculations: CalculationParams[];
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

    const flatItems: {
      position: number;
      categoryId: number;
      subcategoryId?: number;
      questionId?: number;
    }[] = [];

    formTree.categories.forEach((cat) => {
      flatItems.push({ position: cat.position, categoryId: cat.categoryId });

      cat.categoryChildren.forEach((fi) => {
        if (FormItemUtils.isSubcategoryType(fi)) {
          flatItems.push({
            position: fi.position,
            categoryId: cat.categoryId,
            subcategoryId: fi.subcategoryId,
          });
          fi.questions.forEach((q) =>
            flatItems.push({
              ...q,
              categoryId: cat.categoryId,
              subcategoryId: fi.subcategoryId,
            }),
          );
        } else {
          flatItems.push({
            position: fi.position,
            categoryId: cat.categoryId,
            questionId: fi.questionId,
          });
        }
      });
    });

    // #region form items

    const databaseFormItems = await prisma.formItem.findMany({
      where: { formId },
      select: {
        id: true,
        questionId: true,
        categoryId: true,
        subcategoryId: true,
        position: true,
      },
    });

    const formItemsToDelete: { id: number }[] = [];
    const formItemsToUpdate: { id: number; position: number }[] = [];
    const formItemsToInsert: {
      position: number;
      categoryId: number;
      subcategoryId?: number;
      questionId?: number;
    }[] = [];

    // Mapping items to delete or update
    databaseFormItems.forEach((dbFi) => {
      const treeItem = flatItems.find((fi) => {
        return (
          fi.categoryId == dbFi.categoryId &&
          fi.subcategoryId == dbFi.subcategoryId &&
          fi.questionId == dbFi.questionId
        );
      });
      if (treeItem) {
        if (treeItem.position !== dbFi.position) {
          formItemsToUpdate.push({ id: dbFi.id, position: treeItem.position });
        }
      } else {
        formItemsToDelete.push({ id: dbFi.id });
      }
    });

    // Mapping items to insert
    flatItems.forEach((fi) => {
      const exists = databaseFormItems.some((dbFi) => {
        return (
          fi.categoryId == dbFi.categoryId &&
          fi.subcategoryId == dbFi.subcategoryId &&
          fi.questionId == dbFi.questionId
        );
      });
      if (!exists) formItemsToInsert.push(fi);
    });

    // DELETE
    let deleteQuery: Prisma.Sql | null = null;
    if (formItemsToDelete.length) {
      const ids = formItemsToDelete.map((i) => Prisma.sql`${i.id}`);
      deleteQuery = Prisma.sql`DELETE FROM form_item WHERE id IN (${Prisma.join(ids, ",")})`;
    }

    // UPDATE
    let updateQuery: Prisma.Sql | null = null;
    if (formItemsToUpdate.length) {
      const values = formItemsToUpdate.map(
        (i) => Prisma.sql`(${i.id}, ${i.position})`,
      );
      updateQuery = Prisma.sql`
        UPDATE form_item AS fi
        SET position = v.position
        FROM (VALUES ${Prisma.join(values, ",")}) AS v(id, position)
        WHERE fi.id = v.id
      `;
    }

    //INSERT
    let insertQuery: Prisma.Sql | null = null;
    if (formItemsToInsert.length) {
      const values = formItemsToInsert.map(
        (i) =>
          Prisma.sql`(${formId}, ${i.categoryId}, ${i.subcategoryId ?? null}, ${i.questionId ?? null}, ${i.position})`,
      );
      insertQuery = Prisma.sql`INSERT INTO form_item (form_id, category_id, subcategory_id, question_id, position) VALUES ${Prisma.join(values, ",")}`;
    }

    // #endregion

    // #region calculations
    const databaseCalculations = await prisma.calculation.findMany({
      where: {
        formId: formId,
      },
      select: {
        id: true,
        formId: true,
        targetQuestionId: true,
      },
    });

    const calculationsToDelete: {
      id: number;
    }[] = [];
    const calculationsToUpdate: {
      id: number;
      targetQuestionId: number;
      expression: string;
    }[] = [];
    const calculationsToInsert: {
      expression: string;
      targetQuestionId: number;
    }[] = [];

    // Mapping calculations to delete or update
    // Currently calculations cannot be updated directly in the form editor. Review this code if it is implemented.
    databaseCalculations.forEach((dbCalc) => {
      const sentCalculation = calculations.find(
        (calc) => calc.targetQuestionId === dbCalc.targetQuestionId,
      );
      if (sentCalculation) {
        calculationsToUpdate.push({
          id: dbCalc.id,
          targetQuestionId: sentCalculation.targetQuestionId,
          expression: sentCalculation.expression,
        });
      } else {
        calculationsToDelete.push({ id: dbCalc.id });
      }
    });

    // Mapping calculations to insert
    calculations.forEach((calc) => {
      const exists = databaseCalculations.some(
        (dbCalc) => dbCalc.targetQuestionId === calc.targetQuestionId,
      );
      if (!exists) {
        calculationsToInsert.push(calc);
      }
    });

    let calculationsDeleteQuery: Prisma.Sql | null = null;
    if (calculationsToDelete.length > 0) {
      const values = calculationsToDelete.map((i) => Prisma.sql`(${i.id})`);
      calculationsDeleteQuery = Prisma.sql`DELETE FROM calculation WHERE id IN  (${Prisma.join(values, ",")})`;
    }

    let calculationsUpdateQuery: Prisma.Sql | null = null;
    if (calculationsToUpdate.length > 0) {
      const values = calculationsToUpdate.map(
        (i) => Prisma.sql`(${i.id}, ${i.targetQuestionId}, ${i.expression})`,
      );
      calculationsUpdateQuery = Prisma.sql`UPDATE calculation AS c
      SET target_question_Id = v.target_question_Id,
      expression = v.expression
      FROM (VALUES ${Prisma.join(values, ",")}) AS v(id, target_question_Id, expression)
      WHERE c.id = v.id`;
    }

    let calculationsInsertQuery: Prisma.Sql | null = null;
    if (calculationsToInsert.length > 0) {
      const values = calculationsToInsert.map(
        (i) => Prisma.sql`(${formId}, ${i.targetQuestionId}, ${i.expression})`,
      );
      calculationsInsertQuery = Prisma.sql`INSERT INTO calculation (form_id, target_question_Id, expression) VALUES ${Prisma.join(values, ",")}`;
    }

    // INSERT

    // #endregion

    //Transaction
    await prisma.$transaction(async (tx) => {
      if (deleteQuery) {
        await tx.$executeRaw(deleteQuery);
      }
      if (updateQuery) {
        await tx.$executeRaw(updateQuery);
      }
      if (insertQuery) {
        await tx.$executeRaw(insertQuery);
      }
      if (calculationsDeleteQuery) {
        await tx.$executeRaw(calculationsDeleteQuery);
      }
      /*if (calculationsUpdateQuery) {
        await tx.$executeRaw(calculationsUpdateQuery);
      }*/ // Remove comment if calculation update is implemented
      if (calculationsInsertQuery) {
        await tx.$executeRaw(calculationsInsertQuery);
      }
    });

    revalidateTag("form");
    return { statusCode: 200 };
  } catch (e) {
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
