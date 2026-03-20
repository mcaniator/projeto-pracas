import { useHelperCard } from "@/components/context/helperCardContext";
import { useLoadingOverlay } from "@/components/context/loadingContext";
import {
  APIResponse,
  APIResponseInfo,
  FetchAPIOptions,
} from "@/lib/types/backendCalls/APIResponse";
import {
  generateQueryString,
  replaceRouteParams,
} from "@/lib/utils/apiCall";
import { useCallback, useState } from "react";

export function useFetchAPI<
  T,
  P extends Record<string, unknown> = Record<string, unknown>,
>({
  url,
  callbacks,
  options,
}: {
  url: string;
  callbacks?: {
    onSuccess?: (response: APIResponse<T>) => void;
    onError?: (response: APIResponse<T>) => void;
    onCallFailed?: (response: APIResponse<T>) => void;
  };
  options: RequestInit & {
    next?: { tags?: string[] };
  };
}): [
  (
    params: P,
    functionOptions?: FetchAPIOptions,
  ) => Promise<{ responseInfo: APIResponseInfo; data?: T | null }>,
  boolean,
] {
  const { helperCardProcessResponse } = useHelperCard();
  const { setLoadingOverlay } = useLoadingOverlay();
  const [isLoading, setIsLoading] = useState(false);

  const fetchFunction = useCallback(
    async (params: P, functionOptions?: FetchAPIOptions) => {
      setIsLoading(true);
      if (
        functionOptions?.loadingMessage ||
        functionOptions?.showLoadingOverlay
      ) {
        setLoadingOverlay({
          show: true,
          message: functionOptions?.loadingMessage ?? "",
        });
      }
      const { url: parsedUrl, queryParams } = replaceRouteParams(url, params);
      const queryString = generateQueryString(queryParams);
      const fullUrl = queryString ? `${parsedUrl}?${queryString}` : parsedUrl;
      try {
        const response = await fetch(fullUrl, {
          method: options.method,
          ...functionOptions,
        });

        if (!response.ok) {
          const message = await response.text();
          const errorResponseInfo: APIResponseInfo = {
            statusCode: response.status,
            message: message ?? `Erro na requisição ao servidor!`,
          };
          callbacks?.onCallFailed?.({
            responseInfo: errorResponseInfo,
            data: null,
          });
          helperCardProcessResponse(errorResponseInfo);
          setIsLoading(false);
          return {
            responseInfo: errorResponseInfo,
            data: null,
          };
        }

        const json = (await response.json()) as APIResponse<T>;
        if (
          json.responseInfo.statusCode >= 200 &&
          json.responseInfo.statusCode < 300
        ) {
          callbacks?.onSuccess?.(json);
        } else {
          callbacks?.onError?.(json);
        }
        helperCardProcessResponse(json.responseInfo);
        setLoadingOverlay({ show: false });
        setIsLoading(false);
        return {
          responseInfo: json.responseInfo,
          data: json.data,
        };
      } catch (e) {
        const errorResponseInfo: APIResponseInfo = {
          statusCode: 500,
          message: `Erro na requisição ao servidor!`,
        };
        callbacks?.onCallFailed?.({
          responseInfo: errorResponseInfo,
          data: null,
        });
        helperCardProcessResponse(errorResponseInfo);
        setIsLoading(false);
        return {
          responseInfo: errorResponseInfo,
          data: null,
        };
      }
    },
    [],
  );

  return [fetchFunction, isLoading];
}
