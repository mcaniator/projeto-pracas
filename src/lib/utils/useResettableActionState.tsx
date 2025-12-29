import { useHelperCard } from "@/components/context/helperCardContext";
import { useLoadingOverlay } from "@/components/context/loadingContext";
import { APIResponseInfo } from "@/lib/types/backendCalls/APIResponse";
import { startTransition, useActionState, useEffect, useMemo } from "react";

export function useResettableActionState<State, Payload>(
  action: (state: Awaited<State>, payload: Payload) => State | Promise<State>,
  callbacks?: {
    onSuccess?: (state: Awaited<State>) => void;
    onError?: (state: Awaited<State>) => void;
    onCallFailed?: () => void;
    onReset?: () => void;
  },
  options?: { loadingMessage?: string; timeUntilShowTimoutMessage?: number },
  initialState?: Awaited<State>,
  permalink?: string,
): [
  dispatch: (payload: Payload | null) => void,
  isPending: boolean,
  state: Awaited<State>,
  reset: () => void,
] {
  const calculatedInitialState = useMemo(() => {
    if (initialState) {
      return initialState;
    }
    return {
      responseInfo: { statusCode: 0 } as APIResponseInfo,
      data: null,
    } as Awaited<State>;
  }, [initialState]);

  const { setHelperCard, helperCardProcessResponse } = useHelperCard();
  const { setLoadingOverlay } = useLoadingOverlay();
  const [state, submit, isPending] = useActionState(
    async (state: Awaited<State>, payload: Payload | null) => {
      if (!payload) {
        return calculatedInitialState;
      }
      try {
        const data = await action(state, payload);
        // @ts-expect-error TODO: fix typing without breaking the hook usage
        const responseInfo = data.responseInfo as
          | APIResponseInfo
          | undefined
          | null;
        if (responseInfo) {
          // @ts-expect-error TODO: fix typing without breaking the hook usage
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          helperCardProcessResponse(data.responseInfo);
          const statusCode = responseInfo.statusCode;
          if (statusCode >= 200 && statusCode < 300) {
            callbacks?.onSuccess?.(data);
          } else {
            callbacks?.onError?.(data);
          }
        }
        return data;
      } catch (e) {
        setHelperCard({
          show: true,
          helperCardType: "ERROR",
          content: <>Erro ao executar operação!</>,
        });
        callbacks?.onCallFailed?.();
        return calculatedInitialState;
      }
    },
    calculatedInitialState,
    permalink,
  );

  const reset = () => {
    startTransition(() => {
      submit(null);
    });
    callbacks?.onReset?.();
  };

  useEffect(() => {
    if (!options?.loadingMessage) {
      return;
    }

    setLoadingOverlay({ show: isPending, message: options?.loadingMessage });
    if (!isPending) return;

    const timeout = setTimeout(() => {
      setLoadingOverlay({ show: false });
      setHelperCard({
        show: true,
        helperCardType: "ERROR",
        content: <>Tempo de espera excedido!</>,
        customTimeout: 60000,
      });
    }, options?.timeUntilShowTimoutMessage || 30000);
    return () => clearTimeout(timeout);
  }, [isPending]);

  return [submit, isPending, state, reset] as const;
}
