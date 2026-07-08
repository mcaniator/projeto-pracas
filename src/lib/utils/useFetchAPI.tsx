import { useHelperCard } from "@/components/context/helperCardContext";
import { useLoadingOverlay } from "@/components/context/loadingContext";
import {
  APIResponse,
  APIResponseInfo,
  FetchFunctionArgs,
} from "@/lib/types/backendCalls/APIResponse";
import {
  buildApiUrl,
  generateQueryString,
  replaceRouteParams,
} from "@/lib/utils/apiCall";
import { useCallback, useEffect, useRef, useState } from "react";

export function useFetchAPI<
  T,
  P extends Record<string, unknown> = Record<string, unknown>,
  D = unknown,
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
    args?: FetchFunctionArgs<P, D>,
  ) => Promise<{ responseInfo: APIResponseInfo; data?: T | null }>,
  boolean,
] {
  const { helperCardProcessResponse } = useHelperCard();
  const { setLoadingOverlay } = useLoadingOverlay();
  const [isLoading, setIsLoading] = useState(false);
  const callbacksRef = useRef(callbacks);
  const optionsRef = useRef(options);

  useEffect(() => {
    callbacksRef.current = callbacks;
  }, [callbacks]);

  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  const fetchFunction = useCallback(
    async (args?: FetchFunctionArgs<P, D>) => {
      setIsLoading(true);
      const params = args?.params ?? ({} as P);
      const data = args?.data;
      const projectOptions = args?.projectOptions;
      const requestOptions = args?.requestOptions;
      const loadingMessage = projectOptions?.loadingMessage;
      const showLoadingOverlay = projectOptions?.showLoadingOverlay;
      const silent = projectOptions?.silent;

      if (loadingMessage || showLoadingOverlay) {
        setLoadingOverlay({
          show: true,
          message: loadingMessage ?? "",
        });
      }
      const { url: parsedUrl, queryParams } = replaceRouteParams(url, params);
      const queryString = generateQueryString(queryParams);
      const absoluteUrl = buildApiUrl(parsedUrl);
      const fullUrl =
        queryString ? `${absoluteUrl}?${queryString}` : absoluteUrl;
      try {
        const currentOptions = optionsRef.current;
        const currentCallbacks = callbacksRef.current;
        const headers = new Headers(currentOptions.headers);
        new Headers(requestOptions?.headers).forEach((value, key) => {
          headers.set(key, value);
        });
        const isFormData = data instanceof FormData;
        const body =
          data === undefined ?
            requestOptions?.body
          : isFormData ? data
          : JSON.stringify(data);

        if (data !== undefined && !isFormData && !headers.has("Content-Type")) {
          headers.set("Content-Type", "application/json");
        }

        const response = await fetch(fullUrl, {
          ...currentOptions,
          ...requestOptions,
          body,
          credentials:
            requestOptions?.credentials ??
            currentOptions.credentials ??
            "include",
          headers,
          method: currentOptions.method,
        });

        if (!response.ok) {
          const message = await response.text();
          const errorResponseInfo: APIResponseInfo = {
            statusCode: response.status,
            message: message ?? `Erro na requisição ao servidor!`,
          };
          currentCallbacks?.onCallFailed?.({
            responseInfo: errorResponseInfo,
            data: null,
          });
          if (!silent) {
            helperCardProcessResponse(errorResponseInfo);
          }
          setLoadingOverlay({ show: false });
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
          currentCallbacks?.onSuccess?.(json);
        } else {
          currentCallbacks?.onError?.(json);
        }
        if (!silent) {
          helperCardProcessResponse(json.responseInfo);
        }
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
        callbacksRef.current?.onCallFailed?.({
          responseInfo: errorResponseInfo,
          data: null,
        });
        callbacksRef.current?.onError?.({
          responseInfo: errorResponseInfo,
          data: null,
        });
        if (!silent) {
          helperCardProcessResponse(errorResponseInfo);
        }
        setLoadingOverlay({ show: false });
        setIsLoading(false);
        return {
          responseInfo: errorResponseInfo,
          data: null,
        };
      }
    },
    [helperCardProcessResponse, setLoadingOverlay, url],
  );

  return [fetchFunction, isLoading];
}
