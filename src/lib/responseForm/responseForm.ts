import {
  isAssessmentQuestionItem,
  isAssessmentSubcategoryItem,
} from "@/app/admin/assessments/details/responseFormV2";
import {
  FormValues,
  SerializedFormValues,
} from "@/components/ui/responseForm/responseFormTypes";
import dayjs from "@/lib/dayjs";
import {
  AssessmentCategoryItem,
  AssessmentQuestionItem,
} from "@/lib/serverFunctions/queries/assessment";
import { QuestionResponseCharacterTypes } from "@prisma/client";

export const getDateTimeResponseFormat = (question: AssessmentQuestionItem) => {
  switch (question.characterType) {
    case "DATE":
      return "DD/MM/YYYY";
    case "TIME":
      return "HH:mm";
    case "DATETIME":
      return "DD/MM/YYYY HH:mm";
    default:
      throw new Error("Tried to get date format for non-date question");
  }
};

export const buildDateResponseFormatByQuestionId = (
  categories: AssessmentCategoryItem[],
) => {
  const formatByQuestionId = new Map<string, string>();

  categories.forEach((category) => {
    category.categoryChildren.forEach((child) => {
      if (isAssessmentSubcategoryItem(child)) {
        child.questions.forEach((question) => {
          if (
            question.questionType === "WRITTEN" &&
            (question.characterType === "DATE" ||
              question.characterType === "TIME" ||
              question.characterType === "DATETIME")
          ) {
            formatByQuestionId.set(
              String(question.questionId),
              getDateTimeResponseFormat(question),
            );
          }
        });
        return;
      }

      if (
        isAssessmentQuestionItem(child) &&
        child.questionType === "WRITTEN" &&
        (child.characterType === "DATE" ||
          child.characterType === "TIME" ||
          child.characterType === "DATETIME")
      ) {
        formatByQuestionId.set(
          String(child.questionId),
          getDateTimeResponseFormat(child),
        );
      }
    });
  });

  return formatByQuestionId;
};

export const deserializeResponseFormValues = (
  values: SerializedFormValues,
  categories: AssessmentCategoryItem[],
): FormValues => {
  //We need to map all date questions to construct their dayjs objects based on their serialized values
  const dateQuestionsMap = new Map<number, QuestionResponseCharacterTypes>();

  categories.forEach((category) => {
    category.categoryChildren.forEach((child) => {
      if (isAssessmentSubcategoryItem(child)) {
        child.questions.forEach((question) => {
          if (
            question.questionType === "WRITTEN" &&
            (question.characterType === "DATE" ||
              question.characterType === "TIME" ||
              question.characterType === "DATETIME")
          ) {
            dateQuestionsMap.set(question.questionId, question.characterType);
          }
        });
        return;
      }

      if (
        isAssessmentQuestionItem(child) &&
        child.questionType === "WRITTEN" &&
        (child.characterType === "DATE" ||
          child.characterType === "TIME" ||
          child.characterType === "DATETIME")
      ) {
        dateQuestionsMap.set(child.questionId, child.characterType);
      }
    });
  });

  return Object.fromEntries(
    Object.entries(values).map(([key, value]) => {
      const questionDateType = dateQuestionsMap.get(Number(key));
      if (!questionDateType || value === null) {
        return [key, value];
      }

      if (typeof value !== "string") {
        return [key, null];
      }

      if (questionDateType === "DATE") {
        const dateValue = dayjs(value, "DD/MM/YYYY", true);
        return [key, dateValue.isValid() ? dateValue : null];
      }
      if (questionDateType === "TIME") {
        const dateValue = dayjs(value, "HH:mm", true);
        return [key, dateValue.isValid() ? dateValue : null];
      }

      if (questionDateType === "DATETIME") {
        const dateValue = dayjs(value, "DD/MM/YYYY HH:mm", true);
        return [key, dateValue.isValid() ? dateValue : null];
      }

      throw new Error("Untreatable value found");
    }),
  ) as FormValues;
};

export const serializeResponseFormValues = (
  values: FormValues,
  categories: AssessmentCategoryItem[],
) => {
  const dateFormatByQuestionId =
    buildDateResponseFormatByQuestionId(categories);

  return Object.fromEntries(
    Object.entries(values).map(([key, value]) => {
      if (!dayjs.isDayjs(value)) {
        return [key, value];
      }

      const format = dateFormatByQuestionId.get(key);

      return [key, format && value.isValid() ? value.format(format) : null];
    }),
  ) as SerializedFormValues;
};
