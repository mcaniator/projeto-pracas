import { searchDynamicIcons } from "@/lib/serverFunctions/serverOnly/dynamicIconCatalog";
import { APIResponseInfo } from "@/lib/types/backendCalls/APIResponse";
import { z } from "zod";

export const fetchDynamicIconsParamsSchema = z.object({
  query: z.string().optional().nullish(),
  limit: z.coerce.number().int().positive().nullish(),
});

export type FetchDynamicIconsParams = z.infer<
  typeof fetchDynamicIconsParamsSchema
>;

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
