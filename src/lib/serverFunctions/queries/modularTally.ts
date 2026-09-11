import {
  APIRequestParams,
  APIResponseInfo,
} from "@/lib/types/backendCalls/APIResponse";
import { booleanFromString } from "@/lib/zodValidators";
import { prisma } from "@lib/prisma";
import { z } from "zod";

export const fetchModularTallyTemplatesParamsSchema = z.object({
  finalizedOnly: booleanFromString.nullish(),
  includeArchived: booleanFromString.nullish(),
});

export type FetchModularTallyTemplatesParams = z.infer<
  typeof fetchModularTallyTemplatesParamsSchema
>;

export type FetchModularTallyTemplatesResponse = Awaited<
  ReturnType<typeof fetchModularTallyTemplates>
>["data"];

export const fetchModularTallyTemplates = async (
  request: APIRequestParams<FetchModularTallyTemplatesParams>,
) => {
  const params = request.params!;

  try {
    const modularTallyTemplates = await prisma.modularTallyTemplate.findMany({
      where: {
        ...(params.finalizedOnly && { finalized: true }),
        ...(!params.includeArchived && { archived: false }),
      },
      select: {
        id: true,
        name: true,
        finalized: true,
        archived: true,
        updatedAt: true,
        _count: { select: { modularTally: true } },
      },
      orderBy: [{ archived: "asc" }, { updatedAt: "desc" }],
    });

    return {
      responseInfo: { statusCode: 200 } as APIResponseInfo,
      data: { modularTallyTemplates },
    };
  } catch {
    return {
      responseInfo: {
        statusCode: 500,
        message: "Erro ao consultar protocolos de contagem!",
      } as APIResponseInfo,
      data: { modularTallyTemplates: [] },
    };
  }
};
