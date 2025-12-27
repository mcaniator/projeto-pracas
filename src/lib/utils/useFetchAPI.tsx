import { useHelperCard } from "@/components/context/helperCardContext";
import { useLoadingOverlay } from "@/components/context/loadingContext";
import {
  APIResponse,
  APIResponseInfo,
} from "@/lib/types/backendCalls/APIResponse";
import { generateQueryString } from "@/lib/utils/apiCall";
import { useCallback, useState } from "react";

export function useFetchAPI<T, P = Record<string, unknown>>({
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
  options?: RequestInit & {
    next?: { tags?: string[] };
    loadingMessage?: string;
    showLoadingOverlay?: boolean;
  };
}): [
  (params: P) => Promise<{ responseInfo: APIResponseInfo; data: T | null }>,
  boolean,
] {
  const { helperCardProcessResponse } = useHelperCard();
  const { setLoadingOverlay } = useLoadingOverlay();
  const [isLoading, setIsLoading] = useState(false);

  const fetchFunction = useCallback(
    async (params: P) => {
      setIsLoading(true);
      if (options?.loadingMessage || options?.showLoadingOverlay) {
        setLoadingOverlay({
          show: true,
          message: options?.loadingMessage ?? "",
        });
      }
      const queryString = params ? generateQueryString(params) : "";
      const fullUrl = queryString ? `${url}?${queryString}` : url;
      const response = await fetch(fullUrl, options);

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
    },
    [url, options, callbacks, helperCardProcessResponse, setLoadingOverlay],
  );

  return [fetchFunction, isLoading];
}
