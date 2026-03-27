import { FetchDynamicIconsParams } from "@/app/api/admin/forms/dynamicIcons/route";
import { searchDynamicIcons } from "@/lib/serverFunctions/serverOnly/dynamicIconCatalog";
import { APIResponseInfo } from "@/lib/types/backendCalls/APIResponse";

export type FetchDynamicIconsResponse = Awaited<
  ReturnType<typeof fetchDynamicIcons>
>["data"];

const fetchDynamicIcons = (params: FetchDynamicIconsParams) => {
  try {
    const icons = searchDynamicIcons({
      query: params.query,
      limit: params.limit,
    });

    return {
      responseInfo: { statusCode: 200 } as APIResponseInfo,
      data: {
        icons: icons.map((icon) => ({
          key: icon.key,
          iconName: icon.iconName,
        })),
      },
    };
  } catch (error) {
    return {
      responseInfo: {
        statusCode: 500,
        message: "Erro ao consultar icones!",
      } as APIResponseInfo,
      data: {
        icons: [],
      },
    };
  }
};

export { fetchDynamicIcons };
