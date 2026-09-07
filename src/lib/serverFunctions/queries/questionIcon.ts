import { prisma } from "@/lib/prisma";
import { DynamicIconPackId } from "@/lib/questionIcons/dynamicIcon";
import { staticDynamicIconCatalog } from "@/lib/serverFunctions/serverOnly/dynamicIconCatalog";
import {
  APIRequestParams,
  APIResponseInfo,
} from "@/lib/types/backendCalls/APIResponse";
import { booleanFromString } from "@/lib/zodValidators";
import Fuse from "fuse.js";
import { z } from "zod";

export const fetchDynamicIconsParamsSchema = z.object({
  query: z.string().optional().nullish(),
  limit: z.coerce.number().int().positive().nullish(),
  customOnly: booleanFromString.nullish(),
});

export type FetchDynamicIconsParams = z.infer<
  typeof fetchDynamicIconsParamsSchema
>;

export type FetchDynamicIconsResponse = Awaited<
  ReturnType<typeof fetchDynamicIcons>
>["data"];

export const fetchDynamicIcons = async (
  request: APIRequestParams<FetchDynamicIconsParams>,
) => {
  const params = request.params!;
  try {
    const trimmedQuery = params.query?.trim().replace(" ", "-") ?? "";
    const customDynamicIconCatalog = await prisma.customDynamicIcon.findMany({
      select: {
        id: true,
        name: true,
        aliases: true,
      },
    });
    const formattedCustomDynamicIconCatalog = customDynamicIconCatalog.map(
      (icon) => ({
        iconId: icon.id,
        key: `custom:${icon.name}`,
        libraryId: "custom" as const,
        iconName: icon.name,
        aliases: icon.aliases,
      }),
    );

    const completeDynamicIconCatalog =
      params.customOnly ?
        formattedCustomDynamicIconCatalog
      : [...formattedCustomDynamicIconCatalog, ...staticDynamicIconCatalog];

    const dynamicIconFuse = new Fuse(completeDynamicIconCatalog, {
      keys: ["iconName", "aliases"],
      threshold: 0.2,
      ignoreLocation: true,
    });

    const result = searchDynamicIconsFuse({
      query: trimmedQuery,
      limit: params.limit,
      dynamicIconFuse: dynamicIconFuse,
      catalog: completeDynamicIconCatalog,
    });

    return {
      responseInfo: { statusCode: 200 } as APIResponseInfo,
      data: {
        icons: result,
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

const searchDynamicIconsFuse = ({
  query,
  limit,
  dynamicIconFuse,
  catalog,
}: FetchDynamicIconsParams & {
  dynamicIconFuse: Fuse<{
    iconId?: number;
    key: string;
    libraryId: DynamicIconPackId;
    iconName: string;
    aliases: string[] | undefined;
  }>;
  catalog: {
    iconId?: number;
    key: string;
    libraryId: DynamicIconPackId;
    iconName: string;
    aliases: string[] | undefined;
  }[];
}) => {
  if (query && limit) {
    return dynamicIconFuse.search(query, { limit }).map((result) => ({
      iconId: result.item.iconId,
      key: result.item.key,
      iconName: result.item.iconName,
    }));
  }
  if (query) {
    return dynamicIconFuse.search(query).map((result) => ({
      iconId: result.item.iconId,
      key: result.item.key,
      iconName: result.item.iconName,
    }));
  }
  if (limit) {
    return catalog.slice(0, limit).map((entry) => ({
      iconId: entry.iconId,
      key: entry.key,
      iconName: entry.iconName,
    }));
  }
  return catalog.map((entry) => ({
    iconId: entry.iconId,
    key: entry.key,
    iconName: entry.iconName,
  }));
};

export const fetchCustomDynamicIconDetailsParamsSchema = z.object({
  iconId: z.coerce.number().int().positive(),
});

export type FetchCustomDynamicIconDetailsParams = z.infer<
  typeof fetchCustomDynamicIconDetailsParamsSchema
>;

export type FetchCustomDynamicIconDetailsResponse = Awaited<
  ReturnType<typeof fetchCustomDynamicIconDetails>
>["data"];

export const fetchCustomDynamicIconDetails = async (
  request: APIRequestParams<FetchCustomDynamicIconDetailsParams>,
) => {
  const params = request.params!;

  try {
    const customDynamicIcon = await prisma.customDynamicIcon.findUnique({
      where: { id: params.iconId },
      select: {
        id: true,
        name: true,
        aliases: true,
        body: true,
        width: true,
        height: true,
      },
    });

    if (!customDynamicIcon) {
      return {
        responseInfo: {
          statusCode: 404,
          message: "Ícone personalizado não encontrado!",
        } as APIResponseInfo,
        data: null,
      };
    }

    return {
      responseInfo: { statusCode: 200 } as APIResponseInfo,
      data: { customDynamicIcon },
    };
  } catch (error) {
    return {
      responseInfo: {
        statusCode: 500,
        message: "Erro ao consultar ícone personalizado!",
      } as APIResponseInfo,
      data: null,
    };
  }
};

const dynamicIconByKey = new Map(
  staticDynamicIconCatalog.map((entry) => [entry.key, entry]),
);

export const isSupportedDynamicIconKey = async (iconKey: string) => {
  if (dynamicIconByKey.has(iconKey)) {
    return true;
  }
  const customDynamicIcon = await prisma.customDynamicIcon.findUnique({
    where: {
      name: iconKey.split(":")[1],
    },
  });
  return !!customDynamicIcon;
};
