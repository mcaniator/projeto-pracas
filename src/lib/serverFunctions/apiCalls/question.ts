import { FetchQuestionsByCategoryAndSubcategoryParams } from "@/app/api/admin/forms/fieldsCreation/question/route";
import { FetchquestionsByCategoryAndSubcategoryResponse } from "@/lib/serverFunctions/queries/question";
import { UseFetchAPIParams } from "@/lib/types/backendCalls/APIResponse";
import { useFetchAPI } from "@/lib/utils/useFetchAPI";

import { CategoryForQuestionPicker } from "../../types/forms/formCreation";

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
    next: { tags: ["category", "question", "database"] },
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
      next: { tags: ["location", "database"] },
    },
  });
};

export { _searchQuestionsByCategoryAndSubcategory };
