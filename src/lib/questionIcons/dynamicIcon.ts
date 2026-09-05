const DEFAULT_DYNAMIC_ICON_KEY = "tabler:help";

const DYNAMIC_ICON_PACK_IDS = [
  "mdi",
  "tabler",
  "lucide",
  "ri",
  "custom",
] as const;

type DynamicIconPackId = (typeof DYNAMIC_ICON_PACK_IDS)[number];

const buildDynamicIconKey = (libraryId: DynamicIconPackId, iconName: string) =>
  `${libraryId}:${iconName}`;

const dynamicIconNameRegex = /^[a-z0-9]+(-[a-z0-9]+)*$/;

export { DEFAULT_DYNAMIC_ICON_KEY, buildDynamicIconKey, dynamicIconNameRegex };
export type { DynamicIconPackId };
