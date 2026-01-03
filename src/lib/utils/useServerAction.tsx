import { useHelperCard } from "@/components/context/helperCardContext";
import { useLoadingOverlay } from "@/components/context/loadingContext";
import { APIResponse } from "@/lib/types/backendCalls/APIResponse";
import { useCallback, useState } from "react";

export function useServerAction<T, P>({
  action,
  callbacks,
  options,
}: {
  action: (payload: P) => Promise<APIResponse<T>>;
  callbacks?: {
    onSuccess?: (response: APIResponse<T>) => void;
    onError?: (response: APIResponse<T>) => void;
    onCallFailed?: () => void;
  };
  options?: {
    loadingMessage?: string;
    showLoadingOverlay?: boolean;
  };
}): [(payload: P) => Promise<APIResponse<T>>, boolean] {
  const { helperCardProcessResponse, setHelperCard } = useHelperCard();
  const { setLoadingOverlay } = useLoadingOverlay();
  const [isLoading, setIsLoading] = useState(false);

  const callAction = useCallback(
    async (payload: P) => {
      setIsLoading(true);
      if (options?.loadingMessage || options?.showLoadingOverlay) {
        setLoadingOverlay({
          show: true,
          message: options?.loadingMessage ?? "",
        });
      }
      try {
        const result = await action(payload);
        helperCardProcessResponse(result.responseInfo);
        if (
          result.responseInfo.statusCode >= 200 &&
          result.responseInfo.statusCode < 300
        ) {
          callbacks?.onSuccess?.(result);
        } else {
          callbacks?.onError?.(result);
        }
        return result;
      } catch (e) {
        callbacks?.onCallFailed?.();
        setHelperCard({
          show: true,
          helperCardType: "ERROR",
          content: "Erro ao executar a operação!",
        });
        return {
          responseInfo: {
            statusCode: 500,
            message: "Erro ao executar a operação!",
          },
          data: null,
        };
      } finally {
        setIsLoading(false);
        setLoadingOverlay({ show: false });
      }
    },
    [action],
  );

  return [callAction, isLoading];
}
