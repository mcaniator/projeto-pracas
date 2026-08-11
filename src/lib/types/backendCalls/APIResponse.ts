type APIResponseInfo = {
  statusCode: number;
  message?: string | null;
};

type APIResponse<T> = {
  responseInfo: APIResponseInfo;
  data?: T | null;
};

type APIRequest<P = unknown, D = unknown> = {
  params?: P;
  data?: D;
};

type APIRequestParams<P = unknown> = APIRequest<P>;

type APIRequestData<D = unknown> = APIRequest<unknown, D>;

type FetchCallbacks<T> =
  | {
      onSuccess?: (response: APIResponse<T>) => void;
      onError?: (response: APIResponse<T>) => void;
      onServerSuccess?: (response: APIResponse<T>) => void;
      onServerError?: (response: APIResponse<T>) => void;
      onOfflineSuccess?: (response: APIResponse<T>) => void;
      onOfflineError?: (response: APIResponse<T>) => void;
    }
  | undefined;

type UseFetchAPIParams<T> =
  | {
      callbacks?: FetchCallbacks<T>;
    }
  | undefined;

type FetchAPIOptions = {
  loadingMessage?: string;
  showLoadingOverlay?: boolean;
  silent?: boolean;
};

type FetchRequestOptions = Omit<RequestInit, "method">;

type FetchFunctionArgs<
  Params extends Record<string, unknown>,
  Data = unknown,
> = APIRequest<Params, Data> & {
  projectOptions?: FetchAPIOptions;
  requestOptions?: FetchRequestOptions;
};

export type {
  APIResponseInfo,
  APIResponse,
  APIRequest,
  APIRequestParams,
  APIRequestData,
  FetchCallbacks,
  UseFetchAPIParams,
  FetchAPIOptions,
  FetchFunctionArgs,
  FetchRequestOptions,
};
