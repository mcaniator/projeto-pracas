import type {
  FetchQuestionsByCategoryAndSubcategoryParams,
  FetchquestionUsesResponse,
  FetchquestionsByCategoryAndSubcategoryResponse,
} from "@/lib/serverFunctions/queries/question";
import { UseFetchAPIParams } from "@/lib/types/backendCalls/APIResponse";
import { useFetchAPI } from "@/lib/utils/useFetchAPI";

import type {
  DeleteQuestionData,
  DeleteQuestionResponse,
  QuestionSubmitData,
  QuestionUpdateData,
} from "../mutations/questionUtil";

export const useFetchQuestionsByCategoryAndSubcategory = (
  params?: UseFetchAPIParams<FetchquestionsByCategoryAndSubcategoryResponse>,
) => {
  const url = `/api/admin/forms/fieldsCreation/question`;

  return useFetchAPI<
    FetchquestionsByCategoryAndSubcategoryResponse,
    FetchQuestionsByCategoryAndSubcategoryParams
  >({
    url,
    callbacks: params?.callbacks,
    options: {
      method: "GET",
    },
  });
};

export const useFetchQuestionUses = (
  params?: UseFetchAPIParams<FetchquestionUsesResponse>,
) => {
  const url = `/api/admin/forms/fieldsCreation/question/questionUses`;
  return useFetchAPI<FetchquestionUsesResponse>({
    url,
    callbacks: params?.callbacks,
    options: {
      method: "GET",
    },
  });
};

export const useQuestionSubmit = (params?: UseFetchAPIParams<null>) => {
  return useFetchAPI<null, Record<string, never>, QuestionSubmitData>({
    url: "/api/admin/forms/fieldsCreation/question/save",
    callbacks: params?.callbacks,
    options: {
      method: "POST",
    },
  });
};

export const useQuestionUpdate = (params?: UseFetchAPIParams<null>) => {
  return useFetchAPI<null, Record<string, never>, QuestionUpdateData>({
    url: "/api/admin/forms/fieldsCreation/question/update",
    callbacks: params?.callbacks,
    options: {
      method: "POST",
    },
  });
};

export const useDeleteQuestion = (
  params?: UseFetchAPIParams<DeleteQuestionResponse>,
) => {
  return useFetchAPI<
    DeleteQuestionResponse,
    Record<string, never>,
    DeleteQuestionData
  >({
    url: "/api/admin/forms/fieldsCreation/question/delete",
    callbacks: params?.callbacks,
    options: {
      method: "POST",
    },
  });
};
