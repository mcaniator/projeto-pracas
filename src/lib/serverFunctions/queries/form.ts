import { prisma } from "@lib/prisma";

import { CalculationParams } from "../../../app/admin/forms/[formId]/edit/calculations/calculationDialog";
import {
  CategoryItem,
  QuestionItem,
  SubcategoryItem,
} from "../../../app/admin/forms/[formId]/edit/clientV2";
import { Calculation } from "../../utils/calculationUtils";
import { FormItemUtils } from "../../utils/formTreeUtils";

const fetchFormsLatest = async () => {
  try {
    const forms = await prisma.form.findMany({
      select: {
        id: true,
        name: true,
        finalized: true,
        updatedAt: true,
      },
      orderBy: [
        {
          updatedAt: "asc",
        },
      ],
    });
    return { statusCode: 200, forms };
  } catch (e) {
    return { statusCode: 500, forms: [] };
  }
};

const getFormTree = async (formId: number) => {
  try {
    const form = await prisma.form.findUnique({
      where: { id: formId },
      select: {
        id: true,
        name: true,
        finalized: true,
        formItems: {
          orderBy: { position: "asc" },
          include: {
            category: {
              select: {
                name: true,
                notes: true,
              },
            },
            subcategory: {
              select: {
                name: true,
                notes: true,
                categoryId: true,
              },
            },
            question: {
              select: {
                name: true,
                notes: true,
                questionType: true,
                characterType: true,
                optionType: true,
                options: { select: { text: true } },
                categoryId: true,
                subcategoryId: true,
                geometryTypes: true,
              },
            },
          },
        },
      },
    });

    const formItems = form?.formItems ?? [];

    const categories: CategoryItem[] = [];

    if (!form || !formItems) throw new Error("Form not found or has no items");

    const sortedFormItems = formItems.sort((a, b) => {
      const rankDiff =
        FormItemUtils.getItemRankForSorting(a) -
        FormItemUtils.getItemRankForSorting(b);
      if (rankDiff !== 0) return rankDiff;

      return a.position - b.position;
    });

    for (const item of sortedFormItems) {
      // CATEGORY
      if (FormItemUtils.isCategoryType(item)) {
        if (!categories.find((c) => c.categoryId === item.categoryId)) {
          categories.push({
            categoryId: item.categoryId,
            name: item.category.name,
            notes: item.category.notes,
            position: item.position,
            categoryChildren: [],
          });
        }
        continue;
      }

      // SUBCATEGORY
      else if (FormItemUtils.isSubcategoryType(item)) {
        const dbSubcategory = item.subcategory;
        if (!dbSubcategory) {
          throw new Error("Subcategory form item without subcategory data");
        }
        const category = categories.find(
          (c) => c.categoryId === dbSubcategory.categoryId,
        );
        if (!category) {
          throw new Error("Subcategory's category not found");
        }

        let subcategory = category.categoryChildren.find(
          (c): c is SubcategoryItem =>
            FormItemUtils.isSubcategoryType(c) &&
            c.subcategoryId === item.subcategoryId,
        );

        if (!subcategory) {
          subcategory = {
            position: item.position,
            subcategoryId: item.subcategoryId,
            name: dbSubcategory.name,
            notes: dbSubcategory.notes,
            questions: [],
          };
          category.categoryChildren.push(subcategory);
        }
        continue;
      }

      // QUESTION
      else if (FormItemUtils.isQuestionType(item)) {
        const dbQuestion = item.question;
        if (!dbQuestion) {
          throw new Error("Question form item without question data");
        }
        const question: QuestionItem = {
          position: item.position,
          questionId: item.questionId,
          name: dbQuestion.name,
          notes: dbQuestion.notes,
          questionType: dbQuestion.questionType,
          characterType: dbQuestion.characterType,
          optionType: dbQuestion.optionType,
          options: dbQuestion.options,
          geometryTypes: dbQuestion.geometryTypes,
        };
        const category = categories.find(
          (c) => c.categoryId === dbQuestion.categoryId,
        );
        if (!category) {
          throw new Error("Question's category not found");
        }
        if (dbQuestion.subcategoryId) {
          // question is inserted in a subcategory
          const subcategory = category.categoryChildren.find(
            (c): c is SubcategoryItem =>
              FormItemUtils.isSubcategoryType(c) &&
              c.subcategoryId === dbQuestion.subcategoryId,
          );
          if (subcategory) {
            subcategory.questions.push(question);
          }
        } else {
          // question inserted directly in category
          category.categoryChildren.push(question);
        }
        continue;
      }
    }

    // Sorting by position
    categories.sort((a, b) => a.position - b.position);
    categories.forEach((cat) => {
      cat.categoryChildren.sort((a, b) => a.position - b.position);
      cat.categoryChildren.forEach((child) => {
        if (FormItemUtils.isSubcategoryType(child))
          child.questions.sort((a, b) => a.position - b.position);
      });
    });

    return {
      statusCode: 200,
      formTree: {
        id: form.id,
        name: form.name,
        finalized: form.finalized,
        categories: categories,
      },
    };
  } catch (e) {
    return { statusCode: 500, formTree: null };
  }
};

const searchformNameById = async (formId: number) => {
  try {
    const form = await prisma.form.findUnique({
      where: {
        id: formId,
      },
      select: {
        name: true,
      },
    });
    return { statusCode: 200, formName: form?.name ?? null };
  } catch (e) {
    return { statusCode: 500, formName: null };
  }
};

const getCalculationByFormId = async (formId: number) => {
  try {
    const dbCalculations = await prisma.calculation.findMany({
      where: {
        formId: formId,
      },
      select: {
        expression: true,
        targetQuestion: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
    const calculations = dbCalculations.reduce((acc, val) => {
      const calc = new Calculation(val.expression);
      const calcParams = {
        targetQuestionId: val.targetQuestion.id,
        questionName: val.targetQuestion.name,
        expression: val.expression,
        expressionQuestionsIds: calc.getExpressionQuestionIds(),
      };
      acc.push(calcParams);
      return acc;
    }, [] as CalculationParams[]);
    return { statusCode: 200, calculations: calculations };
  } catch (e) {
    return { statusCode: 500, calculations: [] };
  }
};

export {
  fetchFormsLatest,
  getFormTree,
  searchformNameById,
  getCalculationByFormId,
};
