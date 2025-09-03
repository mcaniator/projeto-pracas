import { FormCalculation } from "@customTypes/forms/formCreation";
import { mapFormToFormTree } from "@formatters/formFormatters";
import { prisma } from "@lib/prisma";
import {
  FormItemType,
  OptionTypes,
  QuestionResponseCharacterTypes,
  QuestionTypes,
} from "@prisma/client";
import { QuestionWithCategories } from "@serverActions/questionUtil";
import { getForm } from "@serverOnly/formTree";

import { FormEditorTree } from "../../../app/admin/registration/forms/[formId]/edit/clientV2";

type FormToEditPage = {
  id: number;
  name: string;
  formQuestions: {
    question: QuestionWithCategories;
    position: number;
  }[];
  calculations: FormCalculation[];
};

const fetchFormsLatest = async () => {
  try {
    const forms = await prisma.form.findMany({
      select: {
        id: true,
        name: true,
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
  type FlatFormItem = {
    id: number;
    formItemType: FormItemType;
    referenceId: number;
    position: number;
    parentFormItemId: number | null;
    name: string;
    notes: string | null;
    formItems?: FlatFormItem[]; // para CATEGORY
    questions?: FlatFormItem[]; // para SUBCATEGORY
    questionType?: QuestionTypes;
    characterType?: QuestionResponseCharacterTypes;
    optionType?: OptionTypes | null;
    options?: { text: string }[];
  };
  try {
    const formItems = await prisma.formItem.findMany({
      where: { formId },
      select: {
        id: true,
        formItemType: true,
        referenceId: true,
        position: true,
        parentFormItemId: true,
      },
    });

    //Separate ids per type
    const categoryIds = formItems
      .filter((f) => f.formItemType === "CATEGORY")
      .map((f) => f.referenceId);
    const subcategoryIds = formItems
      .filter((f) => f.formItemType === "SUBCATEGORY")
      .map((f) => f.referenceId);
    const questionIds = formItems
      .filter((f) => f.formItemType === "QUESTION")
      .map((f) => f.referenceId);

    //Fetch data in referenced tables
    const [categories, subcategories, questions] = await Promise.all([
      prisma.category.findMany({
        where: { id: { in: categoryIds } },
        select: { id: true, name: true, notes: true },
      }),
      prisma.subcategory.findMany({
        where: { id: { in: subcategoryIds } },
        select: { id: true, name: true, notes: true, categoryId: true },
      }),
      prisma.question.findMany({
        where: { id: { in: questionIds } },
        select: {
          id: true,
          name: true,
          notes: true,
          questionType: true,
          characterType: true,
          optionType: true,
          categoryId: true,
          subcategoryId: true,
          options: { select: { text: true } },
        },
      }),
      prisma.option.findMany({
        where: { questionId: { in: questionIds } },
        select: { questionId: true, text: true },
      }),
    ]);

    // Mapping data
    const flatItems = formItems.map((fi) => {
      if (fi.formItemType === "CATEGORY") {
        const data = categories.find((c) => c.id === fi.referenceId)!;
        return { ...fi, name: data.name, notes: data.notes, formItems: [] };
      }
      if (fi.formItemType === "SUBCATEGORY") {
        const data = subcategories.find((s) => s.id === fi.referenceId)!;
        return { ...fi, name: data.name, notes: data.notes, questions: [] };
      }
      if (fi.formItemType === "QUESTION") {
        const data = questions.find((q) => q.id === fi.referenceId)!;
        return {
          ...fi,
          name: data.name,
          notes: data.notes,
          questionType: data.questionType,
          characterType: data.characterType,
          optionType: data.optionType,
          options: data.options.map((o) => ({ text: o.text })),
        };
      }
      return fi;
    });

    // Building tree
    const treeCategories: FormEditorTree["categories"] = [];
    const itemMap = new Map<number, FlatFormItem>();
    flatItems.forEach((fi) => itemMap.set(fi.id, fi));

    flatItems.forEach((fi) => {
      if (!fi.parentFormItemId && fi.formItemType === "CATEGORY") {
        treeCategories.push(fi);
      } else if (fi.parentFormItemId) {
        const parent = itemMap.get(fi.parentFormItemId);
        if (!parent) return;

        if (fi.formItemType === "SUBCATEGORY") {
          parent.formItems.push(fi);
        } else if (fi.formItemType === "QUESTION") {
          if (parent.formItemType === "CATEGORY") {
            parent.formItems.push(fi);
          } else if (parent.formItemType === "SUBCATEGORY") {
            parent.questions.push(fi);
          }
        }
      }
    });

    // Ordenar cada nível
    treeCategories.sort((a, b) => a.position - b.position);
    treeCategories.forEach((cat) => {
      cat.formItems.sort((a, b) => a.position - b.position);
      cat.formItems.forEach((sub) => {
        if (sub.questions)
          sub.questions.sort((a, b) => a.position - b.position);
      });
    });

    const form = await prisma.form.findUnique({
      where: { id: formId },
      select: { id: true, name: true },
    });

    return {
      statusCode: 200,
      formTree: {
        id: form!.id,
        name: form!.name,
        categories: treeCategories,
      },
    };
  } catch (e) {
    console.log(e);
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

export { fetchFormsLatest, getFormTree, searchformNameById };
export { type FormToEditPage };
