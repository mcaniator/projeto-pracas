import type {
  CategoryItem,
  QuestionItem,
  SubcategoryItem,
} from "@/app/admin/protocols/forms/edit/clientV2";
import { BooleanResponseValue } from "@/lib/enums/formSubmissionResponse";
import { prisma } from "@/lib/prisma";
import { fetchFormSubmissionGeometries } from "@/lib/serverFunctions/serverOnly/geometries";
import type { SerializedFormValues } from "@/lib/types/formSubmission/responseFormTypes";
import { FormItemUtils } from "@/lib/utils/formTreeUtils";
import { deserializeResponseGeometriesFromWkt } from "@/lib/utils/responseGeometry";

import { getCalculationByFormId, getFormTree } from "./form";

export type FormSubmissionQuestionItem = Omit<QuestionItem, "options"> & {
  id: number;
  options?: {
    id: number;
    text: string;
    isOverridable: boolean;
  }[];
};

export type FormSubmissionSubcategoryItem = Omit<
  SubcategoryItem,
  "questions"
> & {
  id: number;
  questions: FormSubmissionQuestionItem[];
};

export type FormSubmissionCategoryItem = Omit<
  CategoryItem,
  "categoryChildren"
> & {
  id: number;
  categoryChildren: (
    | FormSubmissionQuestionItem
    | FormSubmissionSubcategoryItem
  )[];
};

export type GetFormSubmissionDataParams = {
  formSubmissionId: number;
  includeCalculations: boolean;
  publicQuestionsOnly?: boolean;
};

export const getFormSubmissionData = async ({
  formSubmissionId,
  includeCalculations,
  publicQuestionsOnly = false,
}: GetFormSubmissionDataParams) => {
  const formSubmission = await prisma.formSubmission.findUnique({
    where: { id: formSubmissionId },
    select: { formId: true },
  });

  if (!formSubmission) {
    throw new Error("Submissão de formulário não encontrada");
  }

  const { formId } = formSubmission;
  const [form, responses, responseOptions, rawGeometries, calculationsResult] =
    await Promise.all([
      getFormTree({ formId, publicQuestionsOnly }),
      prisma.response.findMany({
        where: {
          formSubmissionId,
          question: publicQuestionsOnly ? { isPublic: true } : undefined,
        },
        select: { questionId: true, response: true },
      }),
      prisma.responseOption.findMany({
        where: {
          formSubmissionId,
          optionId: { not: null },
          question: publicQuestionsOnly ? { isPublic: true } : undefined,
        },
        orderBy: [{ createdAt: "asc" }, { id: "asc" }],
        select: {
          questionId: true,
          overrideValue: true,
          option: { select: { id: true } },
        },
      }),
      fetchFormSubmissionGeometries({
        formSubmissionId,
        publicQuestionsOnly,
      }),
      includeCalculations ?
        getCalculationByFormId({ formId, publicQuestionsOnly })
      : null,
    ]);

  if (!form.formTree) {
    throw new Error("Formulário não encontrado");
  }

  const responseByQuestionId = new Map(
    responses.map((response) => [response.questionId, response.response]),
  );
  const responseOptionsByQuestionId = responseOptions.reduce<
    Map<number, typeof responseOptions>
  >((result, responseOption) => {
    const questionResponses = result.get(responseOption.questionId) ?? [];
    questionResponses.push(responseOption);
    result.set(responseOption.questionId, questionResponses);
    return result;
  }, new Map());
  const responsesFormValues: SerializedFormValues = {};

  const toQuestionItem = (
    question: QuestionItem,
  ): FormSubmissionQuestionItem => {
    const response = responseByQuestionId.get(question.questionId);
    const optionResponses =
      responseOptionsByQuestionId.get(question.questionId) ?? [];

    if (question.questionType === "WRITTEN") {
      if (
        question.characterType === "NUMBER" ||
        question.characterType === "PERCENTAGE" ||
        question.characterType === "SCALE"
      ) {
        responsesFormValues[question.questionId] =
          response ? Number(response) : null;
      } else {
        responsesFormValues[question.questionId] = response ?? null;
      }
    } else if (question.questionType === "OPTIONS") {
      if (question.optionType === "RADIO") {
        const optionResponse = optionResponses[0];
        responsesFormValues[question.questionId] =
          optionResponse?.option?.id ?
            {
              value: optionResponse.option.id,
              override: optionResponse.overrideValue,
            }
          : null;
      } else if (question.optionType === "CHECKBOX") {
        responsesFormValues[question.questionId] = optionResponses.map(
          (optionResponse) => ({
            value: optionResponse.option!.id,
            override: optionResponse.overrideValue,
          }),
        );
      }
    } else if (question.questionType === "BOOLEAN") {
      responsesFormValues[question.questionId] =
        response === BooleanResponseValue.TRUE;
    }

    return {
      ...question,
      id: question.questionId,
      options: question.options?.map((option) => ({
        id: option.id,
        text: option.text,
        isOverridable: option.isOverridable ?? false,
      })),
    };
  };

  const categories = form.formTree.categories
    .map(
      (category): FormSubmissionCategoryItem => ({
        ...category,
        id: category.categoryId,
        categoryChildren: category.categoryChildren.reduce<
          FormSubmissionCategoryItem["categoryChildren"]
        >((children, child) => {
          if (FormItemUtils.isSubcategoryType(child)) {
            const questions = child.questions.map(toQuestionItem);
            if (questions.length > 0) {
              children.push({
                ...child,
                id: child.subcategoryId,
                questions,
              });
            }
            return children;
          }

          children.push(toQuestionItem(child));
          return children;
        }, []),
      }),
    )
    .filter((category) => category.categoryChildren.length > 0);

  return {
    formTree: {
      ...form.formTree,
      categories,
    },
    calculations: calculationsResult?.calculations ?? [],
    responsesFormValues,
    geometries: rawGeometries.map(({ questionId, geometry }) => ({
      questionId,
      geometries: deserializeResponseGeometriesFromWkt(geometry),
    })),
  };
};

export type GetFormSubmissionDataResult = Awaited<
  ReturnType<typeof getFormSubmissionData>
>;
