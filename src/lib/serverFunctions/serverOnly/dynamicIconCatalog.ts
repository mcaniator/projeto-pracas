import {
  DynamicIconPackId,
  buildDynamicIconKey,
} from "@/lib/questionIcons/dynamicIcon";
import lucide from "@iconify-json/lucide/icons.json";
import mdi from "@iconify-json/mdi/icons.json";
import ri from "@iconify-json/ri/icons.json";
import tabler from "@iconify-json/tabler/icons.json";
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

const staticDynamicIconCatalog = iconModules
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

export { staticDynamicIconCatalog };
