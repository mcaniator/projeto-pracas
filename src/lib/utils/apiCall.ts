import {
  APIResponse,
  APIResponseInfo,
} from "@lib/types/backendCalls/APIResponse";
import { z } from "zod";

export const generatePrismaPaginationObject = ({
  pageNumber,
  pageSize,
}: {
  pageNumber?: number;
  pageSize?: number;
}) => {
  return {
    skip: pageNumber && pageSize ? (pageNumber - 1) * pageSize : undefined,
    take: pageSize,
  };
};

export type PaginationInfo = ReturnType<typeof generatePaginationResponseInfo>;

export const generatePaginationResponseInfo = ({
  totalItems,
  pageNumber,
  pageSize,
}: {
  totalItems?: number;
  pageNumber?: number;
  pageSize?: number;
}) => {
  const total = totalItems ?? 0;
  const page = pageNumber ?? 1;
  const size = pageSize ?? 0;

  const totalPages = size > 0 ? Math.ceil(total / size) : 0;

  const startIndex = total > 0 && size > 0 ? (page - 1) * size + 1 : 0;

  const endIndex = total > 0 && size > 0 ? Math.min(page * size, total) : 0;

  return {
    totalItems: total,
    totalPages,
    startIndex,
    endIndex,
  };
};

export function parseQueryParams<Shape extends z.ZodRawShape>(
  schema: z.ZodObject<Shape>,
  searchParams: URLSearchParams,
): z.infer<z.ZodObject<Shape>> {
  const keys = Object.keys(schema.shape);
  const rawParams = Object.fromEntries(
    keys.map((key) => [key, searchParams.get(key) ?? undefined]),
  );

  return schema.parse(rawParams);
}

export const generateQueryString = <P extends Record<string, unknown>>(
  params: P,
): string => {
  return Object.entries(params)
    .filter(([_, value]) => value !== undefined && value !== null)
    .map(([key, value]) => {
      if (Array.isArray(value)) {
        return `${encodeURIComponent(key)}=${value.map((v) => encodeURIComponent(v instanceof Date ? v.toISOString() : String(v))).join(",")}`;
      } else if (value instanceof Date) {
        return `${encodeURIComponent(key)}=${encodeURIComponent(value.toISOString())}`;
      } else if (typeof value === "number" || typeof value === "boolean") {
        return `${encodeURIComponent(key)}=${encodeURIComponent(value.toString())}`;
      } else if (typeof value === "string") {
        return `${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
      } else {
        throw new Error(`Unsupported query param type for key ${key}`);
      }
    })
    .join("&");
};

export async function fetchAPI<T>({
  url,
  params,
  options,
}: {
  url: string;
  params?: Record<string, unknown>;
  options?: RequestInit & { next?: { tags?: string[] } };
}): Promise<{ responseInfo: APIResponseInfo; data: T | null }> {
  const queryString = params ? generateQueryString(params) : "";
  const fullUrl = queryString ? `${url}?${queryString}` : url;
  const response = await fetch(fullUrl, options);

  if (!response.ok) {
    const message = await response.text();
    return {
      responseInfo: {
        statusCode: response.status,
        message: message ?? `Erro na requisição ao servidor!`,
      },
      data: null,
    };
  }

  const json = (await response.json()) as APIResponse<T>;

  return {
    responseInfo: json.responseInfo,
    data: json.data,
  };
}
