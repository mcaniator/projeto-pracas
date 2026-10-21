import type { FetchModularTallyTemplateStructureResponse } from "@/lib/serverFunctions/queries/modularTally";

export const tallyTemplateGroupDisplayModes = {
  COMMON: "COMMON",
  COUNTERS: "COUNTERS",
  SCREEN_CONTEXT_SELECTOR: "SCREEN_CONTEXT_SELECTOR",
} as const;

export type TallyTemplateGroupDisplayMode =
  (typeof tallyTemplateGroupDisplayModes)[keyof typeof tallyTemplateGroupDisplayModes];

export type TallyTemplateDraftCharacteristic = {
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

type TallyTemplateDraftGroupBase = {
  id: string;
  tallyTemplateGroupId?: number;
  personCharacteristicGroupId: number;
  position: number;
  personCharacteristicGroup: {
    id: number;
    title: string;
    isTagGroup: boolean;
  };
  characteristics: TallyTemplateDraftCharacteristic[];
};

export type TallyTemplateDraftCommonGroup = TallyTemplateDraftGroupBase & {
  displayMode: typeof tallyTemplateGroupDisplayModes.COMMON;
};

export type TallyTemplateDraftSpecialGroup = TallyTemplateDraftGroupBase & {
  displayMode: Exclude<
    TallyTemplateGroupDisplayMode,
    typeof tallyTemplateGroupDisplayModes.COMMON
  >;
};

export type TallyTemplateDraftGroup =
  | TallyTemplateDraftCommonGroup
  | TallyTemplateDraftSpecialGroup;

export const isTallyTemplateDraftCommonGroup = (
  group: TallyTemplateDraftGroup,
): group is TallyTemplateDraftCommonGroup =>
  group.displayMode === tallyTemplateGroupDisplayModes.COMMON;

export const reorderTallyTemplateDraftGroups = (
  groups: TallyTemplateDraftGroup[],
) => {
  const screenContextGroup = groups.find(
    (group) =>
      group.displayMode ===
      tallyTemplateGroupDisplayModes.SCREEN_CONTEXT_SELECTOR,
  );
  const counterGroup = groups.find(
    (group) => group.displayMode === tallyTemplateGroupDisplayModes.COUNTERS,
  );
  const commonGroups = groups
    .filter(isTallyTemplateDraftCommonGroup)
    .sort((first, second) => first.position - second.position);

  return [
    ...(screenContextGroup ? [screenContextGroup] : []),
    ...commonGroups,
    ...(counterGroup ? [counterGroup] : []),
  ].map((group, index) => ({ ...group, position: index + 1 }));
};

export const buildTallyTemplateDraftGroups = (
  groups: FetchModularTallyTemplateStructureResponse["modularTallyTemplate"]["tallyTemplateGroups"],
): TallyTemplateDraftGroup[] =>
  reorderTallyTemplateDraftGroups(
    groups.map((group): TallyTemplateDraftGroup => {
      const baseGroup = {
        id: `person-characteristic-group-${group.personCharacteristicGroup.id}`,
        tallyTemplateGroupId: group.id,
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

      if (group.displayMode === tallyTemplateGroupDisplayModes.COMMON) {
        return {
          ...baseGroup,
          displayMode: tallyTemplateGroupDisplayModes.COMMON,
        };
      }

      return {
        ...baseGroup,
        displayMode: group.displayMode,
      };
    }),
  );
