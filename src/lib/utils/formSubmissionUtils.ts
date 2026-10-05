import type {
  FormSubmissionQuestionItem,
  FormSubmissionSubcategoryItem,
} from "@/lib/serverFunctions/queries/formSubmission";

export const isFormSubmissionSubcategoryItem = (
  item: FormSubmissionQuestionItem | FormSubmissionSubcategoryItem,
): item is FormSubmissionSubcategoryItem => "questions" in item;

export const isFormSubmissionQuestionItem = (
  item: FormSubmissionQuestionItem | FormSubmissionSubcategoryItem,
): item is FormSubmissionQuestionItem => "questionId" in item;
