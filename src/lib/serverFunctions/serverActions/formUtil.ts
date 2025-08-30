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

import { FormEditorTree } from "../../../app/admin/registration/forms/[formId]/edit/clientV2";

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
  newFormName,
  oldFormName,
}: {
  formId: number;
  formTree: FormEditorTree;
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
    const currentTree = await prisma.form.findUnique({
      where: {
        id: formId,
      },
      select: {
        formCategories: {
          select: {
            id: true,
            categoryId: true,
            position: true,
            formQuestions: {
              where: {
                formSubcategoryId: null,
              },
              select: {
                id: true,
                questionId: true,
                position: true,
              },
            },
            formSubcategories: {
              select: {
                id: true,
                subcategoryId: true,
                position: true,
                formQuestions: {
                  select: {
                    id: true,
                    questionId: true,
                    position: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    console.log(currentTree?.formCategories);
    const formQuestionsToDelete: { id: number; questionId: number }[] = [];
    const formSubcategoriesToDelete: number[] = [];
    const formCategoriesToDelete: number[] = [];

    const treeQuestions: {
      id: number;
      position: number;
      category: { id: number; position: number };
      subcategory: { id: number; position: number; categoryId: number } | null;
    }[] = [];
    const treeCategories: { position: number; categoryId: number }[] = [];
    const treeSubcategories: {
      position: number;
      categoryId: number;
      subcategoryId: number;
    }[] = [];

    const formQuestionsToMaintain: {
      id: number;
      questionId: number;
      position: number;
    }[] = [];
    const formCategoriesToMaintain: {
      id: number;
      categoryId: number;
      position: number;
    }[] = [];
    const formSubcategoriesToMaintain: {
      id: number;
      subcategoryId: number;
      position: number;
    }[] = [];

    const categoriesToAdd: { id: number; position: number }[] = [];
    const subcategoriesToAdd: {
      id: number;
      categoryId: number;
      position: number;
    }[] = [];
    const questionsToAdd: {
      id: number;
      category: { id: number; position: number };
      subcategory: { id: number; position: number; categoryId: number } | null;
      position: number;
    }[] = [];

    formTree.categories.forEach((fCategory) => {
      const questions = fCategory.questions;
      const subcategories = fCategory.subcategories;

      questions.forEach((q) => {
        treeQuestions.push({
          id: q.id,
          category: { id: fCategory.id, position: fCategory.position },
          subcategory: null,
          position: q.position,
        });
      });

      subcategories.forEach((s) => {
        s.questions.forEach((q) => {
          treeQuestions.push({
            id: q.id,
            category: { id: fCategory.id, position: fCategory.position },
            subcategory: {
              id: s.id,
              position: s.position,
              categoryId: fCategory.id,
            },
            position: q.position,
          });
        });

        treeSubcategories.push({
          position: s.position,
          categoryId: fCategory.id,
          subcategoryId: s.id,
        });
      });

      treeCategories.push({
        position: fCategory.position,
        categoryId: fCategory.id,
      });
    });

    console.log("current tree", currentTree?.formCategories[0]?.formQuestions);

    currentTree?.formCategories.forEach((c) => {
      let catHasItems = false;
      c.formQuestions.forEach((q) => {
        const updatedQuestion = treeQuestions.find(
          (tQ) => q.questionId === tQ.id,
        );
        if (updatedQuestion) {
          catHasItems = true;
          console.log("PUSHING FROM CAT");
          formQuestionsToMaintain.push({
            ...q,
            position: updatedQuestion.position,
          });
        } else {
          formQuestionsToDelete.push(q);
        }
      });

      c.formSubcategories.forEach((s) => {
        let subHasItems = false;
        s.formQuestions.forEach((q) => {
          const updatedQuestion = treeQuestions.find(
            (tQ) => q.questionId === tQ.id,
          );
          if (updatedQuestion) {
            subHasItems = true;
            catHasItems = true;
            console.log("PUSHING FROM SUB");
            formQuestionsToMaintain.push({
              ...q,
              position: updatedQuestion.position,
            });
          } else {
            formQuestionsToDelete.push(q);
          }
        });
        if (!subHasItems) {
          formSubcategoriesToDelete.push(s.id);
        } else {
          console.log("TREE SUBCATEGORIES", treeSubcategories);
          console.log("CURRENT SUBCATEGORY", s);
          const updatedSubcategory = treeSubcategories.find(
            (ts) => ts.subcategoryId === s.subcategoryId,
          );
          if (!updatedSubcategory) {
            throw new Error("Expected subcategory to exist in form");
          }
          formSubcategoriesToMaintain.push({
            id: s.id,
            subcategoryId: s.subcategoryId,
            position: updatedSubcategory.position,
          });
        }
      });

      if (!catHasItems) {
        formCategoriesToDelete.push(c.id);
      } else {
        const updatedCategory = treeCategories.find(
          (tc) => tc.categoryId === c.categoryId,
        );
        if (!updatedCategory) {
          throw new Error("Expected category to exist in new form");
        }
        formCategoriesToMaintain.push({
          id: c.id,
          categoryId: c.categoryId,
          position: updatedCategory.position,
        });
      }
    });

    treeQuestions.forEach((tQ) => {
      if (
        !formQuestionsToMaintain.some((fq) => fq.questionId === tQ.id) &&
        !formQuestionsToDelete.some((fq) => fq.questionId === tQ.id)
      ) {
        questionsToAdd.push(tQ);
        if (tQ.subcategory) {
          if (
            !formSubcategoriesToMaintain.some(
              (fs) => fs.subcategoryId === tQ.subcategory?.id,
            ) &&
            !subcategoriesToAdd.some((s) => s.id === tQ.subcategory?.id)
          ) {
            subcategoriesToAdd.push({
              id: tQ.subcategory.id,
              categoryId: tQ.category.id,
              position: tQ.subcategory.position,
            });
          }
        }
        if (
          !formCategoriesToMaintain.some(
            (fc) => fc.categoryId === tQ.category.id,
          ) &&
          !categoriesToAdd.some((c) => c.id === tQ.category.id)
        ) {
          categoriesToAdd.push({
            id: tQ.category.id,
            position: tQ.category.position,
          });
        }
      }
    });
    console.log("categories to maintain", formCategoriesToMaintain);
    console.log("categories to delete", formCategoriesToDelete);
    console.log("categories to add:", categoriesToAdd);
    console.log("subcategories to maintain", formCategoriesToMaintain);
    console.log("subcategories to delete", formSubcategoriesToDelete);
    console.log("subcategories to add:", subcategoriesToAdd);
    console.log("questions to maintain", formQuestionsToMaintain);
    console.log("questions to delete", formQuestionsToDelete);
    console.log("questions to add:", questionsToAdd);

    //TODO: DELETIONS FIRST, THEN UPDATES, THEN INSERTS

    //DELETE
    const deleteTransactions: Array<Prisma.Sql> = [];
    if (formQuestionsToDelete.length > 0) {
      const questionsIdsValues = formQuestionsToDelete.map(
        (q) => Prisma.sql`${q.id}`,
      );
      const questionsDelete = Prisma.sql`DELETE FROM "form_question" WHERE id IN (${Prisma.join(questionsIdsValues, ",")})`;
      deleteTransactions.push(questionsDelete);
    }

    if (formSubcategoriesToDelete.length > 0) {
      const subcategoriesIdsValues = formSubcategoriesToDelete.map(
        (id) => Prisma.sql`${id}`,
      );
      const subcategoriesDelete = Prisma.sql`DELETE FROM "form_subcategory" WHERE id IN (${Prisma.join(subcategoriesIdsValues, ",")})`;
      deleteTransactions.push(subcategoriesDelete);
    }

    if (formCategoriesToDelete.length > 0) {
      const categoriesIdsValues = formCategoriesToDelete.map(
        (id) => Prisma.sql`${id}`,
      );
      const categoriesDelete = Prisma.sql`DELETE FROM "form_category" WHERE id IN (${Prisma.join(categoriesIdsValues, ",")})`;
      deleteTransactions.push(categoriesDelete);
    }

    //UPDATE
    const updateTransactions: Array<Prisma.Sql> = [];
    if (formCategoriesToMaintain.length > 0) {
      const categoriesUpdateSqlValues = formCategoriesToMaintain.map(
        (c) => Prisma.sql`(${c.id}, ${c.position})`,
      );
      const categoriesUpdate = Prisma.sql`UPDATE form_category AS fc SET position = v.position
      FROM (VALUES ${Prisma.join(categoriesUpdateSqlValues, ",")}) AS v(id, position)  
      WHERE fc.id = v.id`;

      updateTransactions.push(categoriesUpdate);
    }

    if (formSubcategoriesToMaintain.length > 0) {
      const subcategoriesUpdateSqlValues = formSubcategoriesToMaintain.map(
        (s) => Prisma.sql`(${s.id}, ${s.position})`,
      );
      const subcategoriesUpdate = Prisma.sql`UPDATE form_subcategory AS fs SET position = v.position 
      FROM (VALUES ${Prisma.join(subcategoriesUpdateSqlValues, ",")}) AS v(id, position) 
      WHERE fs.id = v.id`;

      updateTransactions.push(subcategoriesUpdate);
    }

    if (formQuestionsToMaintain.length > 0) {
      const quetionsUpdateSqlValues = formQuestionsToMaintain.map(
        (q) => Prisma.sql`(${q.id}, ${q.position})`,
      );
      const questionsUpdate = Prisma.sql`UPDATE form_question AS fq SET position = v.position 
      FROM (VALUES ${Prisma.join(quetionsUpdateSqlValues, ",")}) AS v(id, position) 
      WHERE fq.id = v.id`;

      updateTransactions.push(questionsUpdate);
    }

    //INSERT
    const insertTransactions: Array<Prisma.Sql> = [];
    if (categoriesToAdd.length > 0) {
      const categoriesInsertSqlValues = categoriesToAdd.map(
        (c) => Prisma.sql`(${formId},${c.id},${c.position})`,
      );
      const categoriesInsert = Prisma.sql`INSERT INTO "form_category" ("form_id", "category_id", "position") 
      VALUES ${Prisma.join(categoriesInsertSqlValues, ",")}`;
      insertTransactions.push(categoriesInsert);
    }

    if (subcategoriesToAdd.length > 0) {
      const subcategoriesInsertSqlValues = subcategoriesToAdd.map(
        (s) =>
          Prisma.sql`((SELECT "id" FROM "form_category" WHERE "form_id" = ${formId} AND "category_id" = ${s.categoryId}), ${s.id}, ${s.position})`,
      );
      const subcategoriesInsert = Prisma.sql`INSERT INTO "form_subcategory" ("form_category_id", "subcategory_id", "position") 
      VALUES ${Prisma.join(subcategoriesInsertSqlValues, ",")}`;
      insertTransactions.push(subcategoriesInsert);
    }

    if (questionsToAdd.length > 0) {
      const questionsInsertSqlValues = questionsToAdd.map(
        (q) =>
          Prisma.sql`((SELECT "id" FROM "form_category" WHERE "form_id" = ${formId} AND "category_id" = ${q.category.id}), 
      ${q.subcategory ? Prisma.sql`(SELECT fs.id FROM form_subcategory fs JOIN form_category fc ON fs.form_category_id = fc.id WHERE fc.form_id = ${formId} AND fc.category_id = ${q.category.id} AND fs.subcategory_id = ${q.subcategory.id})` : Prisma.sql`NULL`}, 
      ${q.id}, ${q.position})`,
      );
      const questionsInsert = Prisma.sql`INSERT INTO "form_question" ("form_category_id", "form_subcategory_id", "question_id", "position") 
      VALUES ${Prisma.join(questionsInsertSqlValues, ",")}`;
      insertTransactions.push(questionsInsert);
    }

    await prisma.$transaction(async (tx) => {
      for (const deleteTransaction of deleteTransactions) {
        await tx.$executeRaw(deleteTransaction);
      }
      for (const update of updateTransactions) {
        await tx.$executeRaw(update);
      }
      for (const insert of insertTransactions) {
        await tx.$executeRaw(insert);
      }
    });

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
