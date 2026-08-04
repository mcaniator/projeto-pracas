import adminSQLiteDb from "@/lib/capacitor/sqlite/adminSQLiteDb/adminSQLiteDb";
import { FetchLocationCategoriesResponse } from "@/lib/serverFunctions/queries/locationCategory";
import {
  APIResponse,
  APIResponseInfo,
} from "@/lib/types/backendCalls/APIResponse";
import { z } from "zod";

const locationCategoriesSchema = z.array(
  z.object({
    id: z.coerce.number(),
    name: z.string(),
  }),
);

const fetchAdminSQLiteLocationCategories = async (): Promise<
  APIResponse<FetchLocationCategoriesResponse>
> => {
  try {
    const locationCategoryValues = await adminSQLiteDb.query({
      statement: "SELECT id, name FROM location_category",
    });
    const categories = locationCategoriesSchema.parse(
      locationCategoryValues.values,
    );

    return {
      responseInfo: {
        statusCode: 200,
      } as APIResponseInfo,
      data: {
        categories,
      },
    };
  } catch (e) {
    return {
      responseInfo: {
        statusCode: 500,
        message: "Erro ao buscar categorias de praças!",
      } as APIResponseInfo,
      data: {
        categories: [],
      },
    };
  }
};

export { fetchAdminSQLiteLocationCategories };
