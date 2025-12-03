import { useHelperCard } from "@/components/context/helperCardContext";
import { startTransition, useActionState } from "react";

export function useResettableActionState<State, Payload>(
  action: (state: Awaited<State>, payload: Payload) => State | Promise<State>,
  initialState: Awaited<State>,
  permalink?: string,
): [
  state: Awaited<State>,
  dispatch: (payload: Payload | null) => void,
  isPending: boolean,
  reset: () => void,
] {
  const { setHelperCard } = useHelperCard();
  const [state, submit, isPending] = useActionState(
    async (state: Awaited<State>, payload: Payload | null) => {
      if (!payload) {
        return initialState;
      }
      try {
        const data = await action(state, payload);
        return data;
      } catch (e) {
        setHelperCard({
          show: true,
          helperCardType: "ERROR",
          content: <>Erro ao executar operação!</>,
        });
        return initialState;
      }
    },
    initialState,
    permalink,
  );

  const reset = () => {
    startTransition(() => {
      submit(null);
    });
  };

  return [state, submit, isPending, reset];
}
