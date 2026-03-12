const DEFAULT_DYNAMIC_ICON_KEY = "tb:TbHelp";

const reactIconPackIds = ["mdi", "tabler", "lucide", "ri"] as const;

type ReactIconPackId = (typeof reactIconPackIds)[number];

const buildDynamicIconKey = (libraryId: ReactIconPackId, iconName: string) =>
  `${libraryId}:${iconName}`;

export { DEFAULT_DYNAMIC_ICON_KEY, buildDynamicIconKey };
export type { ReactIconPackId };
