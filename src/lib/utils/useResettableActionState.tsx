import { useHelperCard } from "@/components/context/helperCardContext";
import { useLoadingOverlay } from "@/components/context/loadingContext";
import { APIResponseInfo } from "@/lib/types/backendCalls/APIResponse";
import { startTransition, useActionState, useEffect, useMemo } from "react";

export function useResettableActionState<State, Payload>(
  action: (state: Awaited<State>, payload: Payload) => State | Promise<State>,
  options?: { loadingMessage?: string },
  initialState?: Awaited<State>,
  permalink?: string,
): [
  dispatch: (payload: Payload | null) => void,
  state: Awaited<State>,
  reset: () => void,
  isPending: boolean,
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
        if (data.responseInfo) {
          // @ts-expect-error TODO: fix typing without breaking the hook usage
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          helperCardProcessResponse(data.responseInfo);
        }
        return data;
      } catch (e) {
        setHelperCard({
          show: true,
          helperCardType: "ERROR",
          content: <>Erro ao executar operação!</>,
        });
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
  };

  useEffect(() => {
    if (!options?.loadingMessage) {
      return;
    }

    setLoadingOverlay({ show: isPending, message: options?.loadingMessage });
  }, [isPending]);

  return [submit, state, reset, isPending] as const;
}
