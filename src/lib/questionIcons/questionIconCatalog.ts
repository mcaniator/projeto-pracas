import { FetchQuestionIconsParams } from "@/app/api/admin/forms/questionIcons/route";
import Fuse from "fuse.js";
import * as ReactIconsAi from "react-icons/ai";
import * as ReactIconsBi from "react-icons/bi";
import * as ReactIconsBs from "react-icons/bs";
import * as ReactIconsCg from "react-icons/cg";
import * as ReactIconsCi from "react-icons/ci";
import * as ReactIconsDi from "react-icons/di";
import * as ReactIconsFa from "react-icons/fa";
import * as ReactIconsFa6 from "react-icons/fa6";
import * as ReactIconsFc from "react-icons/fc";
import * as ReactIconsFi from "react-icons/fi";
import * as ReactIconsGi from "react-icons/gi";
import * as ReactIconsGo from "react-icons/go";
import * as ReactIconsGr from "react-icons/gr";
import * as ReactIconsHi from "react-icons/hi";
import * as ReactIconsHi2 from "react-icons/hi2";
import * as ReactIconsIm from "react-icons/im";
import * as ReactIconsIo from "react-icons/io";
import * as ReactIconsIo5 from "react-icons/io5";
import * as ReactIconsLia from "react-icons/lia";
import * as ReactIconsLu from "react-icons/lu";
import * as ReactIconsMd from "react-icons/md";
import * as ReactIconsPi from "react-icons/pi";
import * as ReactIconsRi from "react-icons/ri";
import * as ReactIconsRx from "react-icons/rx";
import * as ReactIconsSi from "react-icons/si";
import * as ReactIconsSl from "react-icons/sl";
import * as ReactIconsTb from "react-icons/tb";
import * as ReactIconsTfi from "react-icons/tfi";
import * as ReactIconsTi from "react-icons/ti";
import * as ReactIconsVsc from "react-icons/vsc";
import * as ReactIconsWi from "react-icons/wi";
import "server-only";

import {
  DEFAULT_QUESTION_ICON_KEY,
  type QuestionIconLibraryId,
  type ReactIconPackId,
  buildQuestionIconKey,
} from "./questionIconKeys";

const reactIconModulesByPackId: Record<
  ReactIconPackId,
  Record<string, unknown>
> = {
  ai: ReactIconsAi,
  bi: ReactIconsBi,
  bs: ReactIconsBs,
  cg: ReactIconsCg,
  ci: ReactIconsCi,
  di: ReactIconsDi,
  fa: ReactIconsFa,
  fa6: ReactIconsFa6,
  fc: ReactIconsFc,
  fi: ReactIconsFi,
  gi: ReactIconsGi,
  go: ReactIconsGo,
  gr: ReactIconsGr,
  hi: ReactIconsHi,
  hi2: ReactIconsHi2,
  im: ReactIconsIm,
  io: ReactIconsIo,
  io5: ReactIconsIo5,
  lia: ReactIconsLia,
  lu: ReactIconsLu,
  md: ReactIconsMd,
  pi: ReactIconsPi,
  ri: ReactIconsRi,
  rx: ReactIconsRx,
  si: ReactIconsSi,
  sl: ReactIconsSl,
  tb: ReactIconsTb,
  tfi: ReactIconsTfi,
  ti: ReactIconsTi,
  vsc: ReactIconsVsc,
  wi: ReactIconsWi,
};

const createCatalogEntry = (
  libraryId: QuestionIconLibraryId,
  iconName: string,
) => ({
  key: buildQuestionIconKey(libraryId, iconName),
  libraryId,
  iconName,
  label: iconName,
});

const reactCatalogEntries = Object.entries(reactIconModulesByPackId).flatMap(
  ([packId, moduleExports]) => {
    const libraryId = `ri/${packId}` as QuestionIconLibraryId;
    return Object.keys(moduleExports)
      .filter((iconName) => /^[A-Z]/.test(iconName))
      .map((iconName) => createCatalogEntry(libraryId, iconName));
  },
);

const questionIconCatalog = [...reactCatalogEntries];
const questionIconFuse = new Fuse(questionIconCatalog, {
  keys: ["iconName"],
  threshold: 0.0,
  ignoreLocation: true,
});
const questionIconCatalogByKey = new Map(
  questionIconCatalog.map((entry) => [entry.key, entry]),
);

const searchQuestionIcons = ({ query, limit }: FetchQuestionIconsParams) => {
  const trimmedQuery = query?.trim() ?? "";

  if (limit) {
    return questionIconFuse
      .search(trimmedQuery, { limit })
      .map((result) => result.item);
  }
  return questionIconFuse.search(trimmedQuery).map((result) => result.item);
};

const isSupportedQuestionIconKey = (iconKey: string) =>
  questionIconCatalogByKey.has(iconKey);

export {
  DEFAULT_QUESTION_ICON_KEY,
  isSupportedQuestionIconKey,
  searchQuestionIcons,
};
