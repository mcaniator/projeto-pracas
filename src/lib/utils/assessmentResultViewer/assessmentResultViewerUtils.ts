import type { FormValues } from "@/components/ui/responseForm/responseFormTypes";
import { type ResolvedQuestionValue } from "@/components/ui/assessment/questionResponseRenderer";
import {
  AssessmentCategoryItem,
  AssessmentQuestionItem,
} from "@/lib/serverFunctions/queries/assessment";

export type AssessmentTree = {
  categories: AssessmentCategoryItem[];
  responsesFormValues: FormValues;
};

const getQuestionRawValue = (
  assessment: AssessmentTree,
  question: AssessmentQuestionItem,
) => {
  return assessment.responsesFormValues[question.questionId];
};

const getQuestionOptionTextMap = (question: AssessmentQuestionItem) => {
  return new Map(
    (question.options ?? []).map((option) => [option.id, option.text]),
  );
};

const resolveSelectedOptionTexts = (
  question: AssessmentQuestionItem,
  rawValue: string | number | number[] | boolean | null | undefined,
) => {
  const optionTextMap = getQuestionOptionTextMap(question);

  if (question.optionType === "RADIO") {
    if (rawValue === null || rawValue === undefined) {
      return [];
    }

    const optionId = Number(rawValue);
    if (Number.isNaN(optionId)) {
      return [];
    }

    const optionText = optionTextMap.get(optionId);
    return optionText !== undefined && optionText.trim().length > 0 ?
        [optionText]
      : [];
  }

  if (question.optionType === "CHECKBOX") {
    if (!Array.isArray(rawValue)) {
      return [];
    }

    return rawValue
      .map((optionId) => optionTextMap.get(optionId))
      .filter(
        (optionText): optionText is string =>
          optionText !== undefined && optionText.trim().length > 0,
      );
  }

  return [];
};

export const resolveQuestionValue = (
  question: AssessmentQuestionItem,
  rawValue: string | number | number[] | boolean | null | undefined,
): ResolvedQuestionValue => {
  if (rawValue === null || rawValue === undefined) {
    return { kind: "none" };
  }

  if (question.questionType === "BOOLEAN") {
    if (typeof rawValue !== "boolean") {
      return { kind: "none" };
    }

    return { kind: "boolean", value: rawValue };
  }

  if (question.questionType === "OPTIONS") {
    const optionTexts = resolveSelectedOptionTexts(question, rawValue);
    if (optionTexts.length === 0) {
      return { kind: "none" };
    }

    if (
      question.characterType === "NUMBER" ||
      question.characterType === "PERCENTAGE" ||
      question.characterType === "SCALE"
    ) {
      const numericValues = optionTexts
        .map((optionText) => Number(optionText))
        .filter((value) => Number.isFinite(value));

      if (numericValues.length === 0) {
        return { kind: "none" };
      }

      return { kind: "number", values: numericValues };
    }

    return { kind: "text", values: optionTexts };
  }

  if (
    question.characterType === "NUMBER" ||
    question.characterType === "PERCENTAGE" ||
    question.characterType === "SCALE"
  ) {
    if (typeof rawValue === "number" && Number.isFinite(rawValue)) {
      return { kind: "number", values: [rawValue] };
    }

    if (typeof rawValue === "string") {
      const numericValue = Number(rawValue);
      if (Number.isFinite(numericValue)) {
        return { kind: "number", values: [numericValue] };
      }
    }

    return { kind: "none" };
  }

  if (typeof rawValue === "string") {
    const trimmedValue = rawValue.trim();
    if (trimmedValue.length === 0) {
      return { kind: "none" };
    }

    return { kind: "text", values: [trimmedValue] };
  }

  return { kind: "none" };
};

export const resolveAssessmentQuestionValue = (
  assessment: AssessmentTree,
  question: AssessmentQuestionItem,
): ResolvedQuestionValue => {
  return resolveQuestionValue(question, getQuestionRawValue(assessment, question));
};
