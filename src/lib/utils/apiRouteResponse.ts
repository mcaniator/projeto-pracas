import type { APIResponseInfo } from "@/lib/types/backendCalls/APIResponse";

export const responseFromResult = (result: any) => {
  const responseInfo = (result?.responseInfo ?? {
    statusCode: result?.statusCode ?? 200,
  }) as APIResponseInfo;

  return Response.json({
    responseInfo,
    data: result?.data ?? result ?? null,
  });
};
