import type { ModularTallySubmitData } from "@/lib/serverFunctions/mutations/modularTally";
import type { GetModularTallySubmissionDataResult } from "@/lib/serverFunctions/queries/modularTally";

type PersonObservation =
  | GetModularTallySubmissionDataResult["personObservations"][number]
  | ModularTallySubmitData["personObservations"][number];

export type PersonObservationStateItem = {
  personCharacteristicIds: number[];
  quantity: number;
};

export type PersonObservationState = Map<string, PersonObservationStateItem>;

export const normalizePersonCharacteristicIds = (
  personCharacteristicIds: number[],
) => Array.from(new Set(personCharacteristicIds)).sort((a, b) => a - b);

export const getPersonObservationKey = (personCharacteristicIds: number[]) =>
  normalizePersonCharacteristicIds(personCharacteristicIds).join(":");

export const createPersonObservationState = (
  personObservations: PersonObservation[],
) => {
  const state: PersonObservationState = new Map();

  personObservations.forEach((personObservation) => {
    const personCharacteristicIds = normalizePersonCharacteristicIds(
      personObservation.characteristics.map(
        (characteristic) => characteristic.personCharacteristicId,
      ),
    );
    const key = getPersonObservationKey(personCharacteristicIds);
    const currentQuantity = state.get(key)?.quantity ?? 0;

    state.set(key, {
      personCharacteristicIds,
      quantity: currentQuantity + personObservation.quantity,
    });
  });

  return state;
};

export const changePersonObservationQuantity = ({
  state,
  personCharacteristicIds,
  delta,
}: {
  state: PersonObservationState;
  personCharacteristicIds: number[];
  delta: 1 | -1;
}) => {
  const normalizedIds = normalizePersonCharacteristicIds(
    personCharacteristicIds,
  );
  const key = getPersonObservationKey(normalizedIds);
  const currentQuantity = state.get(key)?.quantity ?? 0;
  const nextQuantity = Math.max(0, currentQuantity + delta);

  if (nextQuantity === currentQuantity) return state;

  const nextState = new Map(state);
  if (nextQuantity === 0) {
    nextState.delete(key);
  } else {
    nextState.set(key, {
      personCharacteristicIds: normalizedIds,
      quantity: nextQuantity,
    });
  }

  return nextState;
};

export const serializePersonObservationState = (
  state: PersonObservationState,
) =>
  Array.from(state.values()).map((personObservation) => ({
    quantity: personObservation.quantity,
    characteristics: personObservation.personCharacteristicIds.map(
      (personCharacteristicId) => ({ personCharacteristicId }),
    ),
  }));
