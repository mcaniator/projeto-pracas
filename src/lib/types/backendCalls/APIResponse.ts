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

export type { APIResponseInfo, APIResponse };
