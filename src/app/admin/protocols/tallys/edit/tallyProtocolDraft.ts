import type { FetchTallyProtocolStructureResponse } from "@/lib/serverFunctions/queries/tally";

export const tallyProtocolGroupDisplayModes = {
  COMMON: "COMMON",
  COUNTERS: "COUNTERS",
  SCREEN_CONTEXT_SELECTOR: "SCREEN_CONTEXT_SELECTOR",
} as const;

export type TallyProtocolGroupDisplayMode =
  (typeof tallyProtocolGroupDisplayModes)[keyof typeof tallyProtocolGroupDisplayModes];

export type TallyProtocolDraftCharacteristic = {
  id: string;
  personCharacteristicId: number;
  position: number;
  personCharacteristic: {
    id: number;
    name: string;
    iconKey: string | null;
    color: string;
  };
};

type TallyProtocolDraftGroupBase = {
  id: string;
  tallyProtocolGroupId?: number;
  personCharacteristicGroupId: number;
  position: number;
  personCharacteristicGroup: {
    id: number;
    title: string;
    isTagGroup: boolean;
  };
  characteristics: TallyProtocolDraftCharacteristic[];
};

export type TallyProtocolDraftCommonGroup = TallyProtocolDraftGroupBase & {
  displayMode: typeof tallyProtocolGroupDisplayModes.COMMON;
};

export type TallyProtocolDraftSpecialGroup = TallyProtocolDraftGroupBase & {
  displayMode: Exclude<
    TallyProtocolGroupDisplayMode,
    typeof tallyProtocolGroupDisplayModes.COMMON
  >;
};

export type TallyProtocolDraftGroup =
  | TallyProtocolDraftCommonGroup
  | TallyProtocolDraftSpecialGroup;

export const isTallyProtocolDraftCommonGroup = (
  group: TallyProtocolDraftGroup,
): group is TallyProtocolDraftCommonGroup =>
  group.displayMode === tallyProtocolGroupDisplayModes.COMMON;

export const reorderTallyProtocolDraftGroups = (
  groups: TallyProtocolDraftGroup[],
) => {
  const screenContextGroup = groups.find(
    (group) =>
      group.displayMode ===
      tallyProtocolGroupDisplayModes.SCREEN_CONTEXT_SELECTOR,
  );
  const counterGroup = groups.find(
    (group) => group.displayMode === tallyProtocolGroupDisplayModes.COUNTERS,
  );
  const commonGroups = groups
    .filter(isTallyProtocolDraftCommonGroup)
    .sort((first, second) => first.position - second.position);

  return [
    ...(screenContextGroup ? [screenContextGroup] : []),
    ...commonGroups,
    ...(counterGroup ? [counterGroup] : []),
  ].map((group, index) => ({ ...group, position: index + 1 }));
};

export const buildTallyProtocolDraftGroups = (
  groups: FetchTallyProtocolStructureResponse["tallyProtocol"]["tallyProtocolGroups"],
): TallyProtocolDraftGroup[] =>
  reorderTallyProtocolDraftGroups(
    groups.map((group): TallyProtocolDraftGroup => {
      const baseGroup = {
        id: `person-characteristic-group-${group.personCharacteristicGroup.id}`,
        tallyProtocolGroupId: group.id,
        personCharacteristicGroupId: group.personCharacteristicGroup.id,
        position: group.position,
        personCharacteristicGroup: group.personCharacteristicGroup,
        characteristics: group.characteristics.map((characteristic) => ({
          id: `person-characteristic-${characteristic.personCharacteristic.id}`,
          personCharacteristicId: characteristic.personCharacteristic.id,
          position: characteristic.position,
          personCharacteristic: characteristic.personCharacteristic,
        })),
      };

      if (group.displayMode === tallyProtocolGroupDisplayModes.COMMON) {
        return {
          ...baseGroup,
          displayMode: tallyProtocolGroupDisplayModes.COMMON,
        };
      }

      return {
        ...baseGroup,
        displayMode: group.displayMode,
      };
    }),
  );
