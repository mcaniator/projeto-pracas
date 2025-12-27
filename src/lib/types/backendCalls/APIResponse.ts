type APIResponseInfo = {
  statusCode: number;
  message?: string | null;
  customTimeout?: number;
  showSuccessCard?: boolean;
};

type APIResponse<T> = {
  responseInfo: APIResponseInfo;
  data: T | null;
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

export type { APIResponseInfo, APIResponse, FetchCallbacks, UseFetchAPIParams };
