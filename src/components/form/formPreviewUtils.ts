import type {
  FormSubmissionCategoryItem,
  FormSubmissionQuestionItem,
  FormSubmissionSubcategoryItem,
  GetFormSubmissionDataResult,
} from "@/lib/serverFunctions/queries/formSubmission";
import type { SerializedFormValues } from "@/lib/types/formSubmission/responseFormTypes";
import type {
  CategoryItem,
  FormStructure,
  QuestionItem,
  SubcategoryItem,
} from "@/lib/types/forms/formStructure";
import { FormItemUtils } from "@/lib/utils/formTreeUtils";
import { OptionTypes, QuestionResponseCharacterTypes } from "@prisma/client";

const getInitialQuestionValue = (
  question: QuestionItem,
): SerializedFormValues[string] => {
  if (question.questionType === "OPTIONS") {
    return question.optionType === OptionTypes.CHECKBOX ? [] : null;
  }
  if (question.questionType === "BOOLEAN") return false;
  if (
    question.characterType === QuestionResponseCharacterTypes.NUMBER ||
    question.characterType === QuestionResponseCharacterTypes.PERCENTAGE ||
    question.characterType === QuestionResponseCharacterTypes.SCALE
  ) {
    return null;
  }
  return "";
};

const toFormSubmissionQuestion = (
  question: QuestionItem,
): FormSubmissionQuestionItem => ({
  ...question,
  id: question.questionId,
  options: question.options?.map((option) => ({
    id: option.id,
    text: option.text,
    isOverridable: option.isOverridable ?? false,
  })),
});

const toFormSubmissionSubcategory = ({
  subcategory,
  responsesFormValues,
}: {
  subcategory: SubcategoryItem;
  responsesFormValues: SerializedFormValues;
}): FormSubmissionSubcategoryItem => ({
  ...subcategory,
  id: subcategory.subcategoryId,
  questions: subcategory.questions.map((question) => {
    responsesFormValues[String(question.questionId)] =
      getInitialQuestionValue(question);
    return toFormSubmissionQuestion(question);
  }),
});

const toFormSubmissionCategory = ({
  category,
  responsesFormValues,
}: {
  category: CategoryItem;
  responsesFormValues: SerializedFormValues;
}): FormSubmissionCategoryItem => ({
  ...category,
  id: category.categoryId,
  categoryChildren: category.categoryChildren.map((child) => {
    if (FormItemUtils.isSubcategoryType(child)) {
      return toFormSubmissionSubcategory({
        subcategory: child,
        responsesFormValues,
      });
    }

    responsesFormValues[String(child.questionId)] =
      getInitialQuestionValue(child);
    return toFormSubmissionQuestion(child);
  }),
});

export const buildFormPreviewSubmission = ({
  formStructure,
}: {
  formStructure: FormStructure;
}): GetFormSubmissionDataResult => {
  const responsesFormValues: SerializedFormValues = {};

  return {
    formStructure: {
      formId: formStructure.formId,
      formName: formStructure.formName,
      categories: formStructure.categories.map((category) =>
        toFormSubmissionCategory({ category, responsesFormValues }),
      ),
      calculations: formStructure.calculations ?? [],
    },
    responsesFormValues,
    geometries: [],
  };
};
