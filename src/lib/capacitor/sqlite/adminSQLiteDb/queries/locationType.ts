import adminSQLiteDb from "@/lib/capacitor/sqlite/adminSQLiteDb/adminSQLiteDb";
import { FetchLocationTypesResponse } from "@/lib/serverFunctions/queries/locationType";
import {
  APIResponse,
  APIResponseInfo,
} from "@/lib/types/backendCalls/APIResponse";
import { z } from "zod";

const locationTypesSchema = z.array(
  z.object({
    id: z.coerce.number(),
    name: z.string(),
  }),
);

const fetchAdminSQLiteLocationTypes = async (): Promise<
  APIResponse<FetchLocationTypesResponse>
> => {
  try {
    const locationTypeValues = await adminSQLiteDb.query({
      statement: "SELECT id, name FROM location_type",
    });
    const types = locationTypesSchema.parse(locationTypeValues.values);

    return {
      responseInfo: {
        statusCode: 200,
      } as APIResponseInfo,
      data: {
        types,
      },
    };
  } catch (e) {
    return {
      responseInfo: {
        statusCode: 500,
        message: "Erro ao buscar categorias de praças!",
      } as APIResponseInfo,
      data: {
        types: [],
      },
    };
  }
};

export { fetchAdminSQLiteLocationTypes };
