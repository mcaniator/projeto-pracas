"use client";

import type { APIResponseInfo } from "@/lib/types/backendCalls/APIResponse";
import { useSnackbar } from "notistack";
import { useCallback } from "react";

type NotifyApiResponseOptions = {
  showSuccessMessage?: boolean;
};

export const useAppSnackbar = () => {
  const snackbar = useSnackbar();
  const { enqueueSnackbar } = snackbar;

  const notifyApiResponse = useCallback(
    (
      responseInfo: APIResponseInfo | undefined | null,
      { showSuccessMessage = false }: NotifyApiResponseOptions = {},
    ) => {
      if (
        !responseInfo ||
        responseInfo.statusCode <= 0 ||
        !responseInfo.message
      )
        return;

      const isSuccess =
        responseInfo.statusCode >= 200 && responseInfo.statusCode < 300;

      if (isSuccess && !showSuccessMessage) return;

      enqueueSnackbar(responseInfo.message ?? "", {
        variant: isSuccess ? "success" : "error",
      });
    },
    [enqueueSnackbar],
  );

  return { ...snackbar, notifyApiResponse };
};

export type { NotifyApiResponseOptions };
