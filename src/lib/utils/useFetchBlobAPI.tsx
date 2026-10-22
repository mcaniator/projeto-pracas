import { useLoadingOverlay } from "@/components/context/loadingContext";
import { useAppSnackbar } from "@/lib/hooks/useAppSnackbar";
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

export type FetchBlobAPIResponse = APIResponse<Blob> & {
  filename?: string;
  mimeType?: string;
};

export type UseFetchBlobAPIParams =
  | {
      callbacks?: {
        onSuccess?: (response: FetchBlobAPIResponse) => void;
        onError?: (response: FetchBlobAPIResponse) => void;
        onServerSuccess?: (response: FetchBlobAPIResponse) => void;
        onServerError?: (response: FetchBlobAPIResponse) => void;
      };
    }
  | undefined;

export function useFetchBlobAPI<
  P extends Record<string, unknown> = Record<string, unknown>,
  D = unknown,
>({
  url,
  callbacks,
  options,
}: {
  url: string;
  callbacks?: NonNullable<UseFetchBlobAPIParams>["callbacks"];
  options: RequestInit;
}): [
  (args?: FetchFunctionArgs<P, D>) => Promise<FetchBlobAPIResponse>,
  boolean,
] {
  const { notifyApiResponse } = useAppSnackbar();
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
      const hasLoadingOverlay = loadingMessage || showLoadingOverlay;

      if (hasLoadingOverlay) {
        setLoadingOverlay({
          show: true,
          message: loadingMessage ?? "",
        });
      }

      try {
        const { url: parsedUrl, queryParams } = replaceRouteParams(url, params);
        const queryString = generateQueryString(queryParams);
        const absoluteUrl = buildApiUrl(parsedUrl);
        const fullUrl =
          queryString ? `${absoluteUrl}?${queryString}` : absoluteUrl;
        const currentOptions = optionsRef.current;
        const currentCallbacks = callbacksRef.current;
        const showSuccessMessage = ["POST", "PUT", "DELETE"].includes(
          currentOptions.method?.toUpperCase() ?? "GET",
        );

        const headers = new Headers(currentOptions.headers);
        new Headers(requestOptions?.headers).forEach((value, key) => {
          headers.set(key, value);
        });
        const isFormData = data instanceof FormData;
        const body =
          data === undefined ? requestOptions?.body
          : isFormData ? data
          : JSON.stringify(data);

        if (data !== undefined && !isFormData && !headers.has("Content-Type")) {
          headers.set("Content-Type", "application/json");
        }

        try {
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
            const errorResponseInfo: APIResponseInfo = {
              statusCode: response.status,
              message:
                (await response.text()) || "Erro na requisição ao servidor!",
            };
            const errorResponse: FetchBlobAPIResponse = {
              responseInfo: errorResponseInfo,
              data: null,
            };
            currentCallbacks?.onError?.(errorResponse);
            currentCallbacks?.onServerError?.(errorResponse);
            if (!silent) {
              notifyApiResponse(errorResponseInfo, { showSuccessMessage });
            }
            return errorResponse;
          }

          const contentDisposition = response.headers.get(
            "Content-Disposition",
          );
          const encodedFilename = contentDisposition?.match(
            /filename\*=UTF-8''([^;]+)/i,
          )?.[1];
          const filename =
            (encodedFilename ? decodeURIComponent(encodedFilename) : null) ??
            contentDisposition?.match(/filename="?([^";]+)"?/i)?.[1];
          const mimeType = response.headers.get("Content-Type") ?? undefined;
          const blobResponse: FetchBlobAPIResponse = {
            responseInfo: { statusCode: response.status },
            data: await response.blob(),
            filename,
            mimeType,
          };
          currentCallbacks?.onSuccess?.(blobResponse);
          currentCallbacks?.onServerSuccess?.(blobResponse);
          if (!silent) {
            notifyApiResponse(blobResponse.responseInfo, {
              showSuccessMessage,
            });
          }
          return blobResponse;
        } catch {
          const errorResponse: FetchBlobAPIResponse = {
            responseInfo: {
              statusCode: 500,
              message: "Erro na requisição ao servidor!",
            },
            data: null,
          };
          currentCallbacks?.onServerError?.(errorResponse);
          currentCallbacks?.onError?.(errorResponse);
          if (!silent) notifyApiResponse(errorResponse.responseInfo);
          return errorResponse;
        }
      } catch {
        const errorResponse: FetchBlobAPIResponse = {
          responseInfo: {
            statusCode: 500,
            message: "Erro desconhecido!",
          },
          data: null,
        };
        callbacksRef.current?.onError?.(errorResponse);
        if (!silent) notifyApiResponse(errorResponse.responseInfo);
        return errorResponse;
      } finally {
        if (hasLoadingOverlay) setLoadingOverlay({ show: false });
        setIsLoading(false);
      }
    },
    [notifyApiResponse, setLoadingOverlay, url],
  );

  return [fetchFunction, isLoading];
}
