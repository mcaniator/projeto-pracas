import type { TallyPersonsStatiticsObservation } from "./tallyPersonsStatiticsTypes";

export const getQuantityByCharacteristicId = (
  personObservations: TallyPersonsStatiticsObservation[],
) => {
  const quantities = new Map<number, number>();

  personObservations.forEach((observation) => {
    observation.characteristics.forEach(({ personCharacteristicId }) => {
      quantities.set(
        personCharacteristicId,
        (quantities.get(personCharacteristicId) ?? 0) + observation.quantity,
      );
    });
  });

  return quantities;
};

export const getTotalPeople = (
  personObservations: TallyPersonsStatiticsObservation[],
) =>
  personObservations.reduce(
    (total, observation) => total + observation.quantity,
    0,
  );

export const getPercentageOfPeople = (quantity: number, totalPeople: number) =>
  totalPeople > 0 ? (quantity / totalPeople) * 100 : 0;
