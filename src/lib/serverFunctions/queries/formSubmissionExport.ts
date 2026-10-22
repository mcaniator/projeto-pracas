import type {
  CategoryItem,
  QuestionItem,
} from "@/lib/types/forms/formStructure";
import { FormItemUtils } from "@/lib/utils/formTreeUtils";
import ExcelJS from "exceljs";

import { getFormSubmissionResponsesAndFilterEmptyCategoriesAndSubcategories } from "./formSubmission";

const getExportQuestions = (
  categories: CategoryItem[],
  publicQuestionsOnly: boolean,
): QuestionItem[] => {
  const questions: QuestionItem[] = [];

  categories.forEach((category) => {
    category.categoryChildren.forEach((child) => {
      if (FormItemUtils.isSubcategoryType(child)) {
        child.questions.forEach((question) => {
          if (publicQuestionsOnly && !question.isPublic) return;
          questions.push(question);
        });
        return;
      }

      if (!publicQuestionsOnly || child.isPublic) {
        questions.push(child);
      }
    });
  });

  return questions;
};

const getQuestionResponseCellValue = (
  question: QuestionItem,
  value: unknown,
): ExcelJS.CellValue | null => {
  if (value === null || value === undefined) return null;

  if (question.questionType === "OPTIONS") {
    const selections = Array.isArray(value) ? value : [value];
    const optionTextById = new Map(
      (question.options ?? []).map((option) => [option.id, option.text]),
    );
    const selectedTexts = selections.flatMap((selection) => {
      if (
        typeof selection !== "object" ||
        selection === null ||
        !("value" in selection)
      ) {
        return [];
      }

      const option = selection as { value: number; override?: string | null };
      const text =
        option.override?.trim() ||
        optionTextById.get(option.value) ||
        "TEXTO DA OPÇÃO NÃO ENCONTRADO";
      return [text];
    });
    return selectedTexts.length > 0 ? selectedTexts.join("; ") : null;
  }
  if (typeof value === "boolean") {
    return value ? "Sim" : "Não";
  }
  if (typeof value === "string" || typeof value === "number") {
    return value;
  }

  return null;
};

export const insertFormHeaderInWorkSheet = ({
  categories,
  workSheet,
  publicQuestionsOnly = false,
}: {
  categories: CategoryItem[];
  workSheet: ExcelJS.Worksheet;
  publicQuestionsOnly?: boolean;
}) => {
  const headerFont: Partial<ExcelJS.Font> = { name: "Calibri", bold: true };
  let currentColumn = workSheet.actualColumnCount + 1;

  categories.forEach((category) => {
    const categoryStartColumn = currentColumn;

    category.categoryChildren.forEach((child) => {
      if (FormItemUtils.isSubcategoryType(child)) {
        const questions = child.questions.filter(
          (question) => !publicQuestionsOnly || question.isPublic,
        );
        if (questions.length === 0) return;

        const subcategoryStartColumn = currentColumn;
        questions.forEach((question) => {
          const questionCell = workSheet.getCell(3, currentColumn);
          questionCell.value = question.name;
          questionCell.font = headerFont;
          currentColumn += 1;
        });

        const subcategoryEndColumn = currentColumn - 1;
        const subcategoryCell = workSheet.getCell(2, subcategoryStartColumn);
        subcategoryCell.value = child.name;
        subcategoryCell.font = headerFont;
        if (subcategoryEndColumn > subcategoryStartColumn) {
          workSheet.mergeCells(
            2,
            subcategoryStartColumn,
            2,
            subcategoryEndColumn,
          );
        }
        return;
      }

      if (publicQuestionsOnly && !child.isPublic) return;

      const questionCell = workSheet.getCell(3, currentColumn);
      questionCell.value = child.name;
      questionCell.font = headerFont;
      currentColumn += 1;
    });

    const categoryEndColumn = currentColumn - 1;
    if (categoryEndColumn < categoryStartColumn) return;

    const categoryCell = workSheet.getCell(1, categoryStartColumn);
    categoryCell.value = category.name;
    categoryCell.font = headerFont;
    if (categoryEndColumn > categoryStartColumn) {
      workSheet.mergeCells(1, categoryStartColumn, 1, categoryEndColumn);
    }
  });
};

export const insertFormSubmissionDataInWorkSheet = async ({
  formSubmissionId,
  categories,
  workSheet,
  publicQuestionsOnly = false,
}: {
  formSubmissionId: number;
  categories: CategoryItem[];
  workSheet: ExcelJS.Worksheet;
  publicQuestionsOnly?: boolean;
}) => {
  const { responsesFormValues } =
    await getFormSubmissionResponsesAndFilterEmptyCategoriesAndSubcategories({
      categories,
      formSubmissionId,
      publicQuestionsOnly,
    });

  const questions = getExportQuestions(categories, publicQuestionsOnly);
  if (questions.length === 0) return;

  const responseRow = workSheet.lastRow?.number;
  if (!responseRow || responseRow < 4) {
    throw new Error(
      "O cabeçalho da avaliação deve ser criado antes das respostas",
    );
  }

  const firstQuestionColumn =
    workSheet.actualColumnCount - questions.length + 1;
  questions.forEach((question, index) => {
    workSheet.getCell(responseRow, firstQuestionColumn + index).value =
      getQuestionResponseCellValue(
        question,
        responsesFormValues[question.questionId],
      );
  });
};
