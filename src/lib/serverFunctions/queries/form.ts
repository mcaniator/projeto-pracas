import { FormCalculation } from "@customTypes/forms/formCreation";
import { mapFormToFormTree } from "@formatters/formFormatters";
import { prisma } from "@lib/prisma";
import { QuestionWithCategories } from "@serverActions/questionUtil";
import { getForm } from "@serverOnly/formTree";

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

const getFormTree = async (id: number) => {
  try {
    const form = await getForm(id);
    const formTree = mapFormToFormTree(form);
    return { statusCode: 200, formTree };
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

export { fetchFormsLatest, getFormTree, searchformNameById };
export { type FormToEditPage };
