const CUSTOM_DYNAMIC_ICON_MAX_SIZE = 10 * 1024;

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

export {
  DEFAULT_DYNAMIC_ICON_KEY,
  CUSTOM_DYNAMIC_ICON_MAX_SIZE,
  buildDynamicIconKey,
  dynamicIconNameRegex,
};
export type { DynamicIconPackId };
