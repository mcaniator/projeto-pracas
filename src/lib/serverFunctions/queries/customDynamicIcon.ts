import { prisma } from "@/lib/prisma";
import { blankIconSet } from "@iconify/tools";

import {
  APIRequest,
  APIResponseInfo,
} from "../../types/backendCalls/APIResponse";

export type FetchCustomDynamicIconsResponse = Awaited<
  ReturnType<typeof fetchCustomDynamicIcons>
>["data"];

export const fetchCustomDynamicIcons = async (_request: APIRequest) => {
  try {
    const customDynamicIcons = await prisma.customDynamicIcon.findMany({
      select: {
        name: true,
        body: true,
        width: true,
        height: true,
      },
    });

    const iconSet = blankIconSet("custom");

    for (const icon of customDynamicIcons) {
      iconSet.setIcon(icon.name, {
        body: icon.body,
        width: icon.width,
        height: icon.height,
      });
    }

    return {
      responseInfo: {
        statusCode: 200,
      } as APIResponseInfo,
      data: iconSet.export(),
    };
  } catch (error) {
    return {
      responseInfo: {
        statusCode: 500,
        message: "Erro ao consultar ícones personalizados!",
      } as APIResponseInfo,
      data: null,
    };
  }
};
