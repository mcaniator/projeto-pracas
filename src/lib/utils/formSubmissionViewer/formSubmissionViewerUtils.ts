import type { ResolvedQuestionValue } from "@/components/ui/formSubmissionViewer/questionResponseRenderer";
import type {
  FormSubmissionQuestionItem,
  GetFormSubmissionDataResult,
} from "@/lib/serverFunctions/queries/formSubmission";
import {
  type FormValues,
  type ResponseGeometry,
  type ResponseQuestionValue,
  isFormSubmissionOptionValueWithOverride,
  isFormSubmissionOptionValueWithOverrideArray,
} from "@/lib/types/formSubmission/responseFormTypes";
import dayjs from "dayjs";

export type FormSubmissionViewerData = {
  formTree: GetFormSubmissionDataResult["formTree"];
  responsesFormValues: FormValues;
  geometries: {
    questionId: number;
    geometries: ResponseGeometry[];
  }[];
};

const getQuestionOptionTextMap = (
  question: FormSubmissionQuestionItem,
): Map<number, string> =>
  new Map((question.options ?? []).map((option) => [option.id, option.text]));

const resolveSelectedOptionTexts = (
  question: FormSubmissionQuestionItem,
  rawValue: ResponseQuestionValue | undefined,
): string[] => {
  const optionTextMap = getQuestionOptionTextMap(question);
  if (question.optionType === "RADIO") {
    if (!isFormSubmissionOptionValueWithOverride(rawValue)) return [];
    const computedValue =
      rawValue.override !== null && rawValue.override.length > 0 ?
        rawValue.override
      : (optionTextMap.get(rawValue.value) ?? null);
    return computedValue ? [computedValue] : [];
  }

  if (question.optionType === "CHECKBOX") {
    if (!isFormSubmissionOptionValueWithOverrideArray(rawValue)) return [];
    return rawValue
      .map((option) =>
        option.override !== null && option.override.length > 0 ?
          option.override
        : (optionTextMap.get(option.value) ?? null),
      )
      .filter((option): option is string => option !== null);
  }

  return [];
};

export const resolveQuestionValue = (
  question: FormSubmissionQuestionItem,
  rawValue: ResponseQuestionValue | undefined,
): ResolvedQuestionValue => {
  if (
    rawValue === null ||
    rawValue === undefined ||
    (dayjs.isDayjs(rawValue) && !rawValue.isValid())
  ) {
    return { kind: "none" };
  }

  if (question.questionType === "BOOLEAN") {
    return typeof rawValue === "boolean" ?
        { kind: "boolean", value: rawValue }
      : { kind: "none" };
  }

  if (question.questionType === "OPTIONS") {
    const optionTexts = resolveSelectedOptionTexts(question, rawValue);
    if (optionTexts.length === 0) return { kind: "none" };

    if (
      question.characterType === "NUMBER" ||
      question.characterType === "PERCENTAGE" ||
      question.characterType === "SCALE"
    ) {
      const numericValues = optionTexts
        .map(Number)
        .filter((value) => Number.isFinite(value));
      return numericValues.length > 0 ?
          { kind: "number", values: numericValues }
        : { kind: "none" };
    }

    return { kind: "text", values: optionTexts };
  }

  if (
    question.characterType === "NUMBER" ||
    question.characterType === "PERCENTAGE" ||
    question.characterType === "SCALE"
  ) {
    const numericValue =
      typeof rawValue === "number" ? rawValue
      : typeof rawValue === "string" ? Number(rawValue)
      : Number.NaN;
    return Number.isFinite(numericValue) ?
        { kind: "number", values: [numericValue] }
      : { kind: "none" };
  }

  if (typeof rawValue === "string") {
    const trimmedValue = rawValue.trim();
    return trimmedValue.length > 0 ?
        { kind: "text", values: [trimmedValue] }
      : { kind: "none" };
  }

  if (dayjs.isDayjs(rawValue)) {
    switch (question.characterType) {
      case "DATE":
        return { kind: "text", values: [rawValue.format("DD/MM/YYYY")] };
      case "TIME":
        return { kind: "text", values: [rawValue.format("HH:mm")] };
      case "DATETIME":
        return {
          kind: "text",
          values: [rawValue.format("DD/MM/YYYY HH:mm")],
        };
    }
  }

  return { kind: "none" };
};

export const resolveFormSubmissionQuestionValue = (
  formSubmission: FormSubmissionViewerData,
  question: FormSubmissionQuestionItem,
) =>
  resolveQuestionValue(
    question,
    formSubmission.responsesFormValues[question.questionId],
  );

export const resolveFormSubmissionQuestionGeometries = (
  formSubmission: FormSubmissionViewerData,
  question: FormSubmissionQuestionItem,
): ResponseGeometry[] =>
  formSubmission.geometries.find(
    (geometry) => geometry.questionId === question.questionId,
  )?.geometries ?? [];
