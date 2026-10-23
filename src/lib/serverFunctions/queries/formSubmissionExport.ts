import dayjs from "@/lib/dayjs";
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

const getQuestionResponseCellData = (
  question: QuestionItem,
  value: unknown,
): { value: ExcelJS.CellValue | null; numFmt?: string } => {
  if (question.questionType === "WRITTEN" && typeof value === "string") {
    switch (question.characterType) {
      case "DATE": {
        const date = dayjs(value, "DD/MM/YYYY", true);
        if (date.isValid()) {
          return {
            value: new Date(Date.UTC(date.year(), date.month(), date.date())),
            numFmt: "dd/mm/yyyy",
          };
        }
        break;
      }
      case "TIME": {
        const time = dayjs(value, "HH:mm", true);
        if (time.isValid()) {
          return {
            value: new Date(Date.UTC(1899, 11, 30, time.hour(), time.minute())),
            numFmt: "hh:mm",
          };
        }
        break;
      }
      case "DATETIME": {
        const dateTime = dayjs(value, "DD/MM/YYYY HH:mm", true);
        if (dateTime.isValid()) {
          return {
            value: new Date(
              Date.UTC(
                dateTime.year(),
                dateTime.month(),
                dateTime.date(),
                dateTime.hour(),
                dateTime.minute(),
              ),
            ),
            numFmt: "dd/mm/yyyy hh:mm",
          };
        }
        break;
      }
      default:
        break;
    }
  }

  return { value: getQuestionResponseCellValue(question, value) };
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
          currentColumn += 1;
        });

        const subcategoryEndColumn = currentColumn - 1;
        const subcategoryCell = workSheet.getCell(2, subcategoryStartColumn);
        subcategoryCell.value = child.name;
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
      currentColumn += 1;
    });

    const categoryEndColumn = currentColumn - 1;
    if (categoryEndColumn < categoryStartColumn) return;

    const categoryCell = workSheet.getCell(1, categoryStartColumn);
    categoryCell.value = category.name;
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
    const cell = workSheet.getCell(responseRow, firstQuestionColumn + index);
    const questionResponseCellData = getQuestionResponseCellData(
      question,
      responsesFormValues[question.questionId],
    );

    cell.value = questionResponseCellData.value;
    if (questionResponseCellData.numFmt)
      cell.numFmt = questionResponseCellData.numFmt;
  });
};
