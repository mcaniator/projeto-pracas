import { type ResolvedQuestionValue } from "@/components/ui/assessment/questionResponseRenderer";
import {
  type FormValues,
  type ResponseQuestionValue,
  isAssessmentOptionValueWithOverride,
  isAssessmentOptionValueWithOverrideArray,
} from "@/components/ui/responseForm/responseFormTypes";
import {
  AssessmentCategoryItem,
  AssessmentQuestionItem,
} from "@/lib/serverFunctions/queries/assessment";
import type { ResponseGeometry } from "@/lib/types/assessments/geometry";
import dayjs from "dayjs";

export type AssessmentTree = {
  categories: AssessmentCategoryItem[];
  responsesFormValues: FormValues;
  location?: {
    id: number;
    name: string;
    st_asgeojson?: string | null;
  };
  geometries: {
    questionId: number;
    geometries: ResponseGeometry[];
  }[];
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
  rawValue: ResponseQuestionValue | undefined,
): string[] => {
  const optionTextMap = getQuestionOptionTextMap(question);
  if (question.optionType === "RADIO") {
    if (isAssessmentOptionValueWithOverride(rawValue)) {
      const computedValue =
        rawValue.override !== null && rawValue.override.length > 0 ?
          rawValue.override
        : (optionTextMap.get(rawValue.value) ?? null);
      return computedValue ? [computedValue] : [];
    }
    return [];
  } else if (question.optionType === "CHECKBOX") {
    if (isAssessmentOptionValueWithOverrideArray(rawValue)) {
      return rawValue
        .map((opt) => {
          const computedValue =
            opt.override !== null && opt.override.length > 0 ?
              opt.override
            : (optionTextMap.get(opt.value) ?? null);
          return computedValue;
        })
        .filter((o) => o !== null);
    }
    return [];
  }
  return [];
};

export const resolveQuestionValue = (
  question: AssessmentQuestionItem,
  rawValue: ResponseQuestionValue | undefined,
): ResolvedQuestionValue => {
  //dayjs value should only happen for for written date questions in preview, as the value is stored as a dayjs object in the form state.
  //For options date questions, the value is stored as a string of format DD/MM/YYYY in the form state.
  //For assessments, the value is stored as a string of format DD/MM/YYYY in the database.
  if (
    rawValue === null ||
    rawValue === undefined ||
    (dayjs.isDayjs(rawValue) && !rawValue.isValid())
  ) {
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

  if (dayjs.isDayjs(rawValue)) {
    switch (question.characterType) {
      case "DATE":
        return { kind: "text", values: [rawValue.format("DD/MM/YYYY")] };
      case "TIME":
        return { kind: "text", values: [rawValue.format("HH:mm")] };
      case "DATETIME":
        return { kind: "text", values: [rawValue.format("DD/MM/YYYY HH:mm")] };
    }
  }

  return { kind: "none" };
};

export const resolveAssessmentQuestionValue = (
  assessment: AssessmentTree,
  question: AssessmentQuestionItem,
): ResolvedQuestionValue => {
  return resolveQuestionValue(
    question,
    getQuestionRawValue(assessment, question),
  );
};

export const resolveAssessmentQuestionGeometries = (
  assessment: AssessmentTree,
  question: AssessmentQuestionItem,
): ResponseGeometry[] => {
  return (
    assessment.geometries.find((g) => g.questionId === question.questionId)
      ?.geometries ?? []
  );
};
