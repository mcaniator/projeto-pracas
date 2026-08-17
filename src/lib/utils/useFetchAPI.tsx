import { useLoadingOverlay } from "@/components/context/loadingContext";
import { useNetwork } from "@/components/context/networkContext";
import { useAppSnackbar } from "@/lib/hooks/useAppSnackbar";
import {
  APIRequest,
  APIResponse,
  APIResponseInfo,
  FetchFunctionArgs,
} from "@/lib/types/backendCalls/APIResponse";
import {
  buildApiUrl,
  generateQueryString,
  replaceRouteParams,
} from "@/lib/utils/apiCall";
import { Capacitor } from "@capacitor/core";
import { useCallback, useEffect, useRef, useState } from "react";
import superjson from "superjson";

export function useFetchAPI<
  T,
  P extends Record<string, unknown> = Record<string, unknown>,
  D = unknown,
>({
  url,
  callbacks,
  options,
  offlineFallback,
}: {
  url: string;
  callbacks?: {
    onSuccess?: (response: APIResponse<T>) => void;
    onError?: (response: APIResponse<T>) => void;
    onServerSuccess?: (response: APIResponse<T>) => void;
    onServerError?: (response: APIResponse<T>) => void;
    onOfflineSuccess?: (response: APIResponse<T>) => void;
    onOfflineError?: (response: APIResponse<T>) => void;
  };
  offlineFallback?: (request: APIRequest<P, D>) => Promise<APIResponse<T>>;
  options: RequestInit;
}): [
  (
    args?: FetchFunctionArgs<P, D>,
  ) => Promise<{ responseInfo: APIResponseInfo; data?: T | null }>,
  boolean,
] {
  const { notifyApiResponse } = useAppSnackbar();
  const { setLoadingOverlay } = useLoadingOverlay();
  const { isConnectedRef, setServerOnline } = useNetwork();
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
        const showSuccessMessage = ["POST", "PUT", "DELETE"].includes(
          currentOptions.method?.toUpperCase() ?? "GET",
        );
        const isOffline =
          Capacitor.isNativePlatform() && !isConnectedRef.current;

        if (isOffline) {
          if (!offlineFallback) {
            setLoadingOverlay({ show: false });
            setIsLoading(false);
            return {
              responseInfo: {
                statusCode: 500,
                message: "Offline! Sem conexão com o servidor!",
              },
              data: null,
            };
          }
          try {
            const fallbackResponse = await offlineFallback({ params, data });
            if (
              fallbackResponse.responseInfo.statusCode >= 200 &&
              fallbackResponse.responseInfo.statusCode < 300
            ) {
              currentCallbacks?.onSuccess?.(fallbackResponse);
              currentCallbacks?.onOfflineSuccess?.(fallbackResponse);
            } else {
              currentCallbacks?.onError?.(fallbackResponse);
              currentCallbacks?.onOfflineError?.(fallbackResponse);
            }
            if (!silent) {
              notifyApiResponse(fallbackResponse.responseInfo, {
                showSuccessMessage,
              });
            }
            setLoadingOverlay({ show: false });
            setIsLoading(false);
            return {
              responseInfo: fallbackResponse.responseInfo,
              data: fallbackResponse.data,
            };
          } catch (e) {
            setLoadingOverlay({ show: false });
            setIsLoading(false);
            return {
              responseInfo: {
                statusCode: 500,
                message: "Erro ao carregar dados offline!",
              },
              data: null,
            };
          }
        }

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

          try {
            if (!response.ok) {
              const message = await response.text();
              const errorResponseInfo: APIResponseInfo = {
                statusCode: response.status,
                message: message ?? `Erro na requisição ao servidor!`,
              };
              currentCallbacks?.onError?.({
                responseInfo: errorResponseInfo,
                data: null,
              });
              currentCallbacks?.onServerError?.({
                responseInfo: errorResponseInfo,
                data: null,
              });
              if (!silent) {
                notifyApiResponse(errorResponseInfo, { showSuccessMessage });
              }
              setLoadingOverlay({ show: false });
              setIsLoading(false);
              return {
                responseInfo: errorResponseInfo,
                data: null,
              };
            }
            const jsonText = await response.text();
            const json = superjson.parse<APIResponse<T>>(jsonText);
            if (
              json.responseInfo.statusCode >= 200 &&
              json.responseInfo.statusCode < 300
            ) {
              currentCallbacks?.onSuccess?.(json);
              currentCallbacks?.onServerSuccess?.(json);
            } else {
              currentCallbacks?.onError?.(json);
              currentCallbacks?.onServerError?.(json);
            }
            if (!silent) {
              notifyApiResponse(json.responseInfo, { showSuccessMessage });
            }
            setLoadingOverlay({ show: false });
            setIsLoading(false);
            return {
              responseInfo: json.responseInfo,
              data: json.data,
            };
          } catch (e) {
            setLoadingOverlay({ show: false });
            setIsLoading(false);
            return {
              responseInfo: {
                statusCode: 500,
                message: `Erro ao processar a resposta do servidor!`,
              },
              data: null,
            };
          }
        } catch (e) {
          currentCallbacks?.onServerError?.({
            responseInfo: {
              statusCode: 500,
            } as APIResponseInfo,
            data: null,
          });
          if (Capacitor.isNativePlatform()) {
            setServerOnline(false);
            if (offlineFallback) {
              try {
                const fallbackResponse = await offlineFallback({
                  params,
                  data,
                });
                if (
                  fallbackResponse.responseInfo.statusCode >= 200 &&
                  fallbackResponse.responseInfo.statusCode < 300
                ) {
                  currentCallbacks?.onSuccess?.(fallbackResponse);
                  currentCallbacks?.onOfflineSuccess?.(fallbackResponse);
                } else {
                  currentCallbacks?.onError?.(fallbackResponse);
                  currentCallbacks?.onOfflineError?.(fallbackResponse);
                }
                if (!silent) {
                  notifyApiResponse(fallbackResponse.responseInfo, {
                    showSuccessMessage,
                  });
                }
                setLoadingOverlay({ show: false });
                setIsLoading(false);
                return {
                  responseInfo: fallbackResponse.responseInfo,
                  data: fallbackResponse.data,
                };
              } catch (e) {
                setLoadingOverlay({ show: false });
                setIsLoading(false);
                return {
                  responseInfo: {
                    statusCode: 500,
                    message: "Erro ao carregar dados offline!",
                  },
                  data: null,
                };
              }
            }
          }

          const errorResponseInfo: APIResponseInfo = {
            statusCode: 500,
            message: `Erro na requisição ao servidor!`,
          };
          callbacksRef.current?.onError?.({
            responseInfo: errorResponseInfo,
            data: null,
          });
          if (!silent && !Capacitor.isNativePlatform()) {
            // If is native app, the error about server not found has already been shown after setServerOnline(false)
            notifyApiResponse(errorResponseInfo);
          }
          setLoadingOverlay({ show: false });
          setIsLoading(false);
          return {
            responseInfo: errorResponseInfo,
            data: null,
          };
        }
      } catch (e) {
        const errorResponseInfo: APIResponseInfo = {
          statusCode: 500,
          message: `Erro desconhecido!`,
        };
        callbacksRef.current?.onError?.({
          responseInfo: errorResponseInfo,
          data: null,
        });
        if (!silent) {
          notifyApiResponse(errorResponseInfo);
        }
        setLoadingOverlay({ show: false });
        setIsLoading(false);
        return {
          responseInfo: errorResponseInfo,
          data: null,
        };
      }
    },
    [
      notifyApiResponse,
      offlineFallback,
      setLoadingOverlay,
      isConnectedRef,
      setServerOnline,
      url,
    ],
  );

  return [fetchFunction, isLoading];
}
