import type { FetchDynamicIconsParams } from "@/lib/serverFunctions/apiCalls/questionIconParamsSchemas";
import {
  DynamicIconPackId,
  buildDynamicIconKey,
} from "@/lib/questionIcons/dynamicIcon";
import lucide from "@iconify-json/lucide/icons.json";
import mdi from "@iconify-json/mdi/icons.json";
import ri from "@iconify-json/ri/icons.json";
import tabler from "@iconify-json/tabler/icons.json";
import Fuse from "fuse.js";
import "server-only";

const iconModules = [mdi, tabler, lucide, ri];

const createCatalogEntry = (
  libraryId: DynamicIconPackId,
  iconName: string,
  aliases?: string[],
) => ({
  key: buildDynamicIconKey(libraryId, iconName),
  libraryId,
  iconName,
  aliases,
});

const dynamicIconCatalog = iconModules
  .flatMap((module) => {
    const libraryId = `${module.prefix}` as DynamicIconPackId;
    const aliasesByParent = Object.entries(module.aliases ?? {}).reduce(
      (aliasesByParent, [alias, data]) => {
        const aliases = aliasesByParent.get(data.parent) ?? [];
        aliases.push(alias);
        aliasesByParent.set(data.parent, aliases);

        return aliasesByParent;
      },
      new Map<string, string[]>(),
    );

    return Object.keys(module.icons).map((iconName) => {
      const aliases = aliasesByParent.get(iconName);

      return createCatalogEntry(libraryId, iconName, aliases);
    });
  })
  .sort((a, b) => a.iconName.localeCompare(b.iconName));

const dynamicIconFuse = new Fuse(dynamicIconCatalog, {
  keys: ["iconName", "aliases"],
  threshold: 0.2,
  ignoreLocation: true,
});
const dynamicIconByKey = new Map(
  dynamicIconCatalog.map((entry) => [entry.key, entry]),
);

const searchDynamicIcons = ({ query, limit }: FetchDynamicIconsParams) => {
  const trimmedQuery = query?.trim().replace(" ", "-") ?? "";

  if (trimmedQuery && limit) {
    return dynamicIconFuse.search(trimmedQuery, { limit }).map((result) => ({
      key: result.item.key,
      iconName: result.item.iconName,
    }));
  }
  if (trimmedQuery) {
    return dynamicIconFuse.search(trimmedQuery).map((result) => ({
      key: result.item.key,
      iconName: result.item.iconName,
    }));
  }
  if (limit) {
    return dynamicIconCatalog.slice(0, limit).map((entry) => ({
      key: entry.key,
      iconName: entry.iconName,
    }));
  }
  return dynamicIconCatalog.map((entry) => ({
    key: entry.key,
    iconName: entry.iconName,
  }));
};

const isSupportedDynamicIconKey = (iconKey: string) =>
  dynamicIconByKey.has(iconKey);

export { isSupportedDynamicIconKey, searchDynamicIcons };
