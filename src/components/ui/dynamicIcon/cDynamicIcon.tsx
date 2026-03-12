import { DEFAULT_DYNAMIC_ICON_KEY } from "@/lib/questionIcons/dynamicIcon";
import lucide from "@iconify-json/lucide/icons.json";
import mdi from "@iconify-json/mdi/icons.json";
import ri from "@iconify-json/ri/icons.json";
import tabler from "@iconify-json/tabler/icons.json";
import { Icon, addCollection } from "@iconify/react";

addCollection(mdi);
addCollection(tabler);
addCollection(lucide);
addCollection(ri);

const CDynamicIcon = ({ iconKey }: { iconKey?: string | null }) => {
  return <Icon icon={iconKey ?? DEFAULT_DYNAMIC_ICON_KEY} />;
};

export default CDynamicIcon;
