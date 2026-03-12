import { FetchDynamicIconsParams } from "@/app/api/admin/forms/dynamicIcons/route";
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

const catalogEntries = iconModules.flatMap((module) => {
  const libraryId = `${module.prefix}` as DynamicIconPackId;
  return Object.keys(module.icons).map((iconName) => {
    const aliases = Object.entries(module.aliases)
      .filter(([, data]) => data.parent === iconName)
      .map(([alias]) => alias);

    return createCatalogEntry(libraryId, iconName, aliases);
  });
});

const dynamicIconCatalog = [...catalogEntries];
const dynamicIconFuse = new Fuse(dynamicIconCatalog, {
  keys: ["iconName", "aliases"],
  threshold: 0.1,
  ignoreLocation: true,
});
const dynamicIconByKey = new Map(
  dynamicIconCatalog.map((entry) => [entry.key, entry]),
);

const searchDynamicIcons = ({ query, limit }: FetchDynamicIconsParams) => {
  const trimmedQuery = query?.trim().replace(" ", "-") ?? "";

  if (limit) {
    return dynamicIconFuse.search(trimmedQuery, { limit }).map((result) => ({
      key: result.item.key,
      iconName: result.item.iconName,
    }));
  }
  return dynamicIconFuse.search(trimmedQuery).map((result) => ({
    key: result.item.key,
    iconName: result.item.iconName,
  }));
};

const isSupportedDynamicIconKey = (iconKey: string) =>
  dynamicIconByKey.has(iconKey);

export { isSupportedDynamicIconKey, searchDynamicIcons };
