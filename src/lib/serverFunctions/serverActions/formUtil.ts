"use server";

import { prisma } from "@/lib/prisma";
import { APIResponseInfo } from "@/lib/types/backendCalls/APIResponse";
import { booleanFromString, formSchema } from "@/lib/zodValidators";
import { FormCalculation } from "@customTypes/forms/formCreation";
import { Prisma } from "@prisma/client";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { checkIfLoggedInUserHasAnyPermission } from "@serverOnly/checkPermission";
import { revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { CalculationParams } from "../../../app/admin/forms/[formId]/edit/calculations/calculationDialog";
import { FormEditorTree } from "../../../app/admin/forms/[formId]/edit/clientV2";
import { FormItemUtils } from "../../utils/formTreeUtils";

const _createForm = async (
  prevState: { responseInfo: APIResponseInfo },
  formData: FormData,
) => {
  try {
    await checkIfLoggedInUserHasAnyPermission({ roles: ["FORM_MANAGER"] });
  } catch (e) {
    return {
      responseInfo: {
        statusCode: 401,
        message: "Permissão inválida!",
      } as APIResponseInfo,
    };
  }
  try {
    const newFormData = formSchema.parse({
      name: formData.get("name"),
      cloneFormId: formData.get("cloneFormId"),
    });
    try {
      if (newFormData.cloneFormId) {
        //CLONE FORM
        const formToBeCloned = await prisma.form.findUniqueOrThrow({
          where: {
            id: newFormData.cloneFormId,
          },
          include: {
            formItems: true,
            calculations: true,
          },
        });
        await prisma.$transaction(async (tx) => {
          const form = await tx.form.create({
            data: {
              name: newFormData.name,
            },
            select: {
              id: true,
            },
          });

          const formAttributesTransactions: Array<
            Prisma.PrismaPromise<number>
          > = [];

          const formItemsSQLValues = formToBeCloned.formItems.map(
            (item) =>
              Prisma.sql`(${form.id}, ${item.position}, ${item.categoryId}, ${item.subcategoryId}, ${item.questionId})`,
          );

          if (formItemsSQLValues.length > 0) {
            const formItemsQuery = Prisma.sql`INSERT INTO "form_item" ("form_id", "position", "category_id", "subcategory_id", "question_id")
            VALUES ${Prisma.join(formItemsSQLValues, ",")}`;
            formAttributesTransactions.push(tx.$queryRaw(formItemsQuery));
          }

          const calculationsSQLValues = formToBeCloned.calculations.map(
            (calculation) =>
              Prisma.sql`(${form.id}, ${calculation.expression}, ${calculation.targetQuestionId})`,
          );

          if (calculationsSQLValues.length > 0) {
            const calculationsQuery = Prisma.sql`INSERT INTO "calculation" ("form_id", "expression", "target_question_id")
            VALUES ${Prisma.join(calculationsSQLValues, ",")}`;
            formAttributesTransactions.push(tx.$queryRaw(calculationsQuery));
          }

          await Promise.all(formAttributesTransactions);
        });
      } else {
        //CREATE EMPTY FORM
        await prisma.form.create({
          data: {
            name: newFormData.name,
          },
        });
      }

      revalidateTag("form");
      return {
        responseInfo: {
          statusCode: 200,
          showSuccessCard: true,
          message: "Formulário criado com sucesso!",
        } as APIResponseInfo,
      };
    } catch (e) {
      return {
        responseInfo: {
          statusCode: 500,
          message: "Erro ao criar formulário!",
        } as APIResponseInfo,
      };
    }
  } catch (e) {
    return {
      responseInfo: {
        statusCode: 401,
        message: "Dados inválidos!",
      } as APIResponseInfo,
    };
  }
};

const _updateFormV2 = async ({
  formId,
  formTree,
  calculations,
  isFinalized,
  newFormName,
}: {
  formId: number;
  formTree: FormEditorTree;
  calculations: CalculationParams[];
  isFinalized: boolean;
  newFormName?: string;
}) => {
  try {
    await checkIfLoggedInUserHasAnyPermission({ roles: ["FORM_MANAGER"] });
  } catch (e) {
    return { statusCode: 401 };
  }
  try {
    const currentForm = await prisma.form.findFirst({
      where: {
        id: formId,
        finalized: false,
      },
    });
    if (!currentForm) {
      return { statusCode: 400 };
    }

    await prisma.form.update({
      data: { name: newFormName, finalized: isFinalized },
      where: { id: formId },
    });

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

    // Currently calculations cannot be updated directly in the form editor. Review this code if it is implemented.
    /*let calculationsUpdateQuery: Prisma.Sql | null = null;
    if (calculationsToUpdate.length > 0) {
      const values = calculationsToUpdate.map(
        (i) => Prisma.sql`(${i.id}, ${i.targetQuestionId}, ${i.expression})`,
      );
      calculationsUpdateQuery = Prisma.sql`UPDATE calculation AS c
      SET target_question_Id = v.target_question_Id,
      expression = v.expression
      FROM (VALUES ${Prisma.join(values, ",")}) AS v(id, target_question_Id, expression)
      WHERE c.id = v.id`;
    }*/

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

const _updateFormArchiveStatus = async (
  prevState: { responseInfo: APIResponseInfo },
  formData: FormData,
) => {
  try {
    await checkIfLoggedInUserHasAnyPermission({ roles: ["FORM_MANAGER"] });
  } catch (e) {
    return {
      responseInfo: {
        statusCode: 401,
        message: "Permissão inválida!",
      } as APIResponseInfo,
    };
  }

  try {
    const formId = z.coerce.number().parse(formData.get("formId"));
    const archived = booleanFromString.parse(formData.get("archived"));
    const dbForm = await prisma.form.findUniqueOrThrow({
      where: { id: formId },
      select: {
        finalized: true,
      },
    });

    if (!dbForm.finalized) {
      // Forms in construction are permanently deleted
      await prisma.$transaction(async (tx) => {
        await tx.formItem.deleteMany({ where: { formId: formId } });
        await tx.calculation.deleteMany({ where: { formId: formId } });
        await tx.form.delete({ where: { id: formId } });
      });
    } else {
      await prisma.form.update({
        where: {
          id: formId,
        },
        data: {
          archived,
        },
      });
    }

    return {
      responseInfo: {
        statusCode: 200,
        showSuccessCard: true,
        message:
          archived ?
            `Formulário ${dbForm.finalized ? "arquivado" : "excluído"} com sucesso!`
          : "Formulário desarquivado com sucesso!",
      } as APIResponseInfo,
    };
  } catch (e) {
    console.log(e);
    return {
      responseInfo: {
        statusCode: 500,
        message: "Erro ao arquivar formulário!",
      } as APIResponseInfo,
    };
  }
};

export { _updateFormV2, _createForm, _updateFormArchiveStatus };
