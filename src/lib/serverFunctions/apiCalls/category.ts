import { APIResponseInfo } from "../../types/backendCalls/APIResponse";
import {
  CategoriesWithQuestions,
  CategoriesWithQuestionsAndStatusCode,
} from "../queries/category";

const _getCategoriesWithSubcategories = async () => {
  const url = "/api/admin/forms/categoriesWithSubcategories";

  const response = await fetch(url, {
    method: "GET",
    next: { tags: ["category", "form", "database"] },
  });

  if (!response.ok) {
    return {
      responseInfo: {
        statusCode: response.status,
        message: "Erro ao obter categorias",
      },
      categories: [],
    } as { responseInfo: APIResponseInfo; categories: CategoriesWithQuestions };
  }

  const categories =
    (await response.json()) as CategoriesWithQuestionsAndStatusCode;

  if (categories.statusCode !== 200) {
    return {
      responseInfo: {
        statusCode: response.status,
        message: "Erro ao obter categorias",
      },
      categories: categories.categories,
    } as { responseInfo: APIResponseInfo; categories: CategoriesWithQuestions };
  }

  return {
    responseInfo: {
      statusCode: response.status,
      message: "Categorias carregadas!",
    },
    categories: categories.categories,
  } as { responseInfo: APIResponseInfo; categories: CategoriesWithQuestions };
};

export { _getCategoriesWithSubcategories };
