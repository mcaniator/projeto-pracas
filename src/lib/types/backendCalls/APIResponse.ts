type APIResponseInfo = {
  statusCode: number;
  message?: string | null;
  customTimeout?: number;
  showSuccessCard?: boolean;
};

type APIResponse<T> = {
  responseInfo: APIResponseInfo;
  data?: T | null;
};

type FetchCallbacks<T> =
  | {
      onSuccess?: (response: APIResponse<T>) => void;
      onError?: (response: APIResponse<T>) => void;
      onCallFailed?: (response: APIResponse<T>) => void;
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

type FetchRequestOptions = Omit<RequestInit, "method"> & {
  next?: { tags?: string[] };
};

type FetchFunctionArgs<
  Params extends Record<string, unknown>,
  Data = unknown,
> = {
  params?: Params;
  data?: Data;
  projectOptions?: FetchAPIOptions;
  requestOptions?: FetchRequestOptions;
};

export type {
  APIResponseInfo,
  APIResponse,
  FetchCallbacks,
  UseFetchAPIParams,
  FetchAPIOptions,
  FetchFunctionArgs,
  FetchRequestOptions,
};
