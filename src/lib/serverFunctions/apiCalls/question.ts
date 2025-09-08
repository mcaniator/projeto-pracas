import { FormQuestion } from "@customTypes/forms/formCreation";

const _searchQuestionsByCategoryAndSubcategory = async ({
  categoryId,
  subcategoryId,
  verifySubcategoryNullness,
}: {
  categoryId?: number;
  subcategoryId: number | null;
  verifySubcategoryNullness: boolean;
}) => {
  const queryParams = new URLSearchParams();

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

  queryParams.append("verCatNull", String(verifySubcategoryNullness));

  const url = `/api/admin/forms/fieldsCreation/question?${queryParams.toString()}`;

  const questionsResponse = await fetch(url, {
    method: "GET",
    next: { tags: ["category", "question", "database"] },
  });
  if (!questionsResponse.ok) {
    return { statusCode: 500, questions: [] as FormQuestion[] };
  }
  const questions = (await questionsResponse.json()) as {
    statusCode: number;
    questions: FormQuestion[];
  };
  return questions;
};

export { _searchQuestionsByCategoryAndSubcategory };
