import type {
  FetchQuestionsByCategoryAndSubcategoryParams,
  FetchquestionUsesResponse,
  FetchquestionsByCategoryAndSubcategoryResponse,
} from "@/lib/serverFunctions/queries/question";
import { UseFetchAPIParams } from "@/lib/types/backendCalls/APIResponse";
import { useFetchAPI } from "@/lib/utils/useFetchAPI";

import type { CategoryForQuestionPicker } from "../../types/forms/formCreation";
import type {
  DeleteQuestionData,
  DeleteQuestionResponse,
  QuestionSubmitData,
  QuestionUpdateData,
} from "../mutations/questionUtil";

const _searchQuestionsByCategoryAndSubcategory = async ({
  name,
  categoryId,
  subcategoryId,
  verifySubcategoryNullness,
}: {
  name?: string;
  categoryId?: number;
  subcategoryId?: number | null;
  verifySubcategoryNullness?: boolean;
}) => {
  const queryParams = new URLSearchParams();

  if (name) {
    queryParams.append("name", name);
  } else {
    if (categoryId !== undefined) {
      queryParams.append("categoryId", String(categoryId));
    }

    if (
      subcategoryId !== undefined &&
      subcategoryId !== -1 &&
      subcategoryId !== 0
    ) {
      queryParams.append("subcategoryId", String(subcategoryId));
    }

    queryParams.append(
      "verCatNull",
      String(
        verifySubcategoryNullness === undefined ? false : (
          verifySubcategoryNullness
        ),
      ),
    );
  }

  const url = `/api/admin/forms/fieldsCreation/question?${queryParams.toString()}`;

  const questionsResponse = await fetch(url, {
    method: "GET",
  });
  if (!questionsResponse.ok) {
    return { statusCode: 500, categories: [] as CategoryForQuestionPicker[] };
  }
  const categories = (await questionsResponse.json()) as {
    statusCode: number;
    categories: CategoryForQuestionPicker[];
  };
  return categories;
};

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

export { _searchQuestionsByCategoryAndSubcategory };
