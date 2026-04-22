const DEFAULT_DYNAMIC_ICON_KEY = "tabler:help";

const DYNAMIC_ICON_PACK_IDS = ["mdi", "tabler", "lucide", "ri"] as const;

type DynamicIconPackId = (typeof DYNAMIC_ICON_PACK_IDS)[number];

const buildDynamicIconKey = (libraryId: DynamicIconPackId, iconName: string) =>
  `${libraryId}:${iconName}`;

export { DEFAULT_DYNAMIC_ICON_KEY, buildDynamicIconKey };
export type { DynamicIconPackId };
