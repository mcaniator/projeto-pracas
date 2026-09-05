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
        name: true,
        aliases: true,
      },
    });
    const formattedCustomDynamicIconCatalog = customDynamicIconCatalog.map(
      (icon) => ({
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
    key: string;
    libraryId: DynamicIconPackId;
    iconName: string;
    aliases: string[] | undefined;
  }>;
  catalog: {
    key: string;
    libraryId: DynamicIconPackId;
    iconName: string;
    aliases: string[] | undefined;
  }[];
}) => {
  if (query && limit) {
    return dynamicIconFuse.search(query, { limit }).map((result) => ({
      key: result.item.key,
      iconName: result.item.iconName,
    }));
  }
  if (query) {
    return dynamicIconFuse.search(query).map((result) => ({
      key: result.item.key,
      iconName: result.item.iconName,
    }));
  }
  if (limit) {
    return catalog.slice(0, limit).map((entry) => ({
      key: entry.key,
      iconName: entry.iconName,
    }));
  }
  return catalog.map((entry) => ({
    key: entry.key,
    iconName: entry.iconName,
  }));
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
