import { UseFetchAPIParams } from "@/lib/types/backendCalls/APIResponse";
import { useFetchAPI } from "@/lib/utils/useFetchAPI";
import type { FetchPasswordResetTokenParams } from "./passwordResetParamsSchemas";

export type { FetchPasswordResetTokenParams } from "./passwordResetParamsSchemas";

export type FetchPasswordResetTokenResponse = {
  email: string | null;
};

export const useFetchPasswordResetToken = (
  params?: UseFetchAPIParams<FetchPasswordResetTokenResponse>,
) => {
  return useFetchAPI<
    FetchPasswordResetTokenResponse,
    FetchPasswordResetTokenParams
  >({
    url: "/api/auth/passwordResetToken",
    callbacks: params?.callbacks,
    options: {
      method: "GET",
    },
  });
};
