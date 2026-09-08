import adminSQLiteDb from "@/lib/capacitor/sqlite/adminSQLiteDb/adminSQLiteDb";
import { FetchCustomDynamicIconsResponse } from "@/lib/serverFunctions/queries/customDynamicIcon";
import {
  APIRequest,
  APIRequestData,
  APIResponse,
  APIResponseInfo,
} from "@/lib/types/backendCalls/APIResponse";
import { IconifyJSON } from "@iconify/react";
import { z } from "zod";

const emptyCustomDynamicIconCollection: IconifyJSON = {
  prefix: "custom",
  icons: {},
};

const customDynamicIconRowsSchema = z.array(
  z.object({
    iconifyJson: z.string(),
  }),
);

const fetchAdminSQLiteCustomDynamicIcons = async (
  _request: APIRequest,
): Promise<APIResponse<FetchCustomDynamicIconsResponse>> => {
  try {
    const customDynamicIconValues = await adminSQLiteDb.query({
      statement: "SELECT iconify_json AS iconifyJson FROM custom_dynamic_icon",
    });
    const [customDynamicIcon] = customDynamicIconRowsSchema.parse(
      customDynamicIconValues.values,
    );
    const icons =
      customDynamicIcon ?
        (JSON.parse(customDynamicIcon.iconifyJson) as IconifyJSON)
      : emptyCustomDynamicIconCollection;

    return {
      responseInfo: {
        statusCode: 200,
      } as APIResponseInfo,
      data: { icons },
    };
  } catch (error) {
    return {
      responseInfo: {
        statusCode: 500,
        message: "Erro ao consultar ícones personalizados offline!",
      } as APIResponseInfo,
      data: null,
    };
  }
};

type SaveAdminSQLiteCustomDynamicIconsData = {
  icons: IconifyJSON;
};

const saveAdminSQLiteCustomDynamicIcons = async (
  request: APIRequestData<SaveAdminSQLiteCustomDynamicIconsData>,
) => {
  const data = request.data;
  if (!data) {
    return {
      responseInfo: {
        statusCode: 400,
        message: "Dados inválidos para salvar ícones personalizados offline!",
      } as APIResponseInfo,
    };
  }

  try {
    await adminSQLiteDb.executeTransaction([
      {
        statement: "DELETE FROM custom_dynamic_icon",
      },
      {
        statement: "INSERT INTO custom_dynamic_icon (iconify_json) VALUES (?)",
        values: [JSON.stringify(data.icons)],
      },
    ]);

    return {
      responseInfo: {
        statusCode: 200,
      } as APIResponseInfo,
    };
  } catch (error) {
    return {
      responseInfo: {
        statusCode: 500,
        message: "Erro ao salvar ícones personalizados offline!",
      } as APIResponseInfo,
    };
  }
};

export {
  fetchAdminSQLiteCustomDynamicIcons,
  saveAdminSQLiteCustomDynamicIcons,
};
