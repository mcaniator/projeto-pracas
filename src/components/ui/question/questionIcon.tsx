"use client";

import {
  DEFAULT_QUESTION_ICON_KEY,
  type ReactIconPackId,
  parseQuestionIconKey,
} from "@/lib/questionIcons/questionIconKeys";
import { CircularProgress } from "@mui/material";
import { useEffect, useState } from "react";
import { IoIosHelp } from "react-icons/io";

type QuestionIconComponentType = React.ComponentType<{
  className?: string;
  size?: number | string;
}>;

type QuestionIconProps = {
  iconKey?: string;
  className?: string;
  size?: number | string;
};

const reactIconPackImporters: Record<
  ReactIconPackId,
  () => Promise<Record<string, unknown>>
> = {
  ai: () => import("react-icons/ai"),
  bi: () => import("react-icons/bi"),
  bs: () => import("react-icons/bs"),
  cg: () => import("react-icons/cg"),
  ci: () => import("react-icons/ci"),
  di: () => import("react-icons/di"),
  fa: () => import("react-icons/fa"),
  fa6: () => import("react-icons/fa6"),
  fc: () => import("react-icons/fc"),
  fi: () => import("react-icons/fi"),
  gi: () => import("react-icons/gi"),
  go: () => import("react-icons/go"),
  gr: () => import("react-icons/gr"),
  hi: () => import("react-icons/hi"),
  hi2: () => import("react-icons/hi2"),
  im: () => import("react-icons/im"),
  io: () => import("react-icons/io"),
  io5: () => import("react-icons/io5"),
  lia: () => import("react-icons/lia"),
  lu: () => import("react-icons/lu"),
  md: () => import("react-icons/md"),
  pi: () => import("react-icons/pi"),
  ri: () => import("react-icons/ri"),
  rx: () => import("react-icons/rx"),
  si: () => import("react-icons/si"),
  sl: () => import("react-icons/sl"),
  tb: () => import("react-icons/tb"),
  tfi: () => import("react-icons/tfi"),
  ti: () => import("react-icons/ti"),
  vsc: () => import("react-icons/vsc"),
  wi: () => import("react-icons/wi"),
};

const iconPackagePromiseCache = new Map<
  string,
  Promise<Record<string, unknown>>
>();
const iconComponentPromiseCache = new Map<
  string,
  Promise<QuestionIconComponentType | null>
>();
const iconComponentCache = new Map<string, QuestionIconComponentType | null>();

const getIconPackageExports = (
  iconKey: string,
): Promise<Record<string, unknown> | null> => {
  const parsed = parseQuestionIconKey(iconKey);
  if (!parsed) {
    return Promise.resolve(null);
  }

  const packageId = parsed.libraryId;
  const existingPromise = iconPackagePromiseCache.get(packageId);
  if (existingPromise) {
    return existingPromise;
  }

  const [, packId] = packageId.split("/");
  if (!packId) {
    return Promise.resolve<Record<string, unknown> | null>(null);
  }
  const importer = reactIconPackImporters[packId as ReactIconPackId];
  if (!importer) {
    return Promise.resolve<Record<string, unknown> | null>(null);
  }
  const packagePromise = importer();

  iconPackagePromiseCache.set(
    packageId,
    packagePromise.then((moduleExports) => moduleExports ?? {}),
  );
  return packagePromise;
};

const loadQuestionIconComponent = async (
  iconKey: string,
): Promise<QuestionIconComponentType | null> => {
  const cachedComponent = iconComponentCache.get(iconKey);
  if (cachedComponent !== undefined) {
    return cachedComponent;
  }

  const existingPromise = iconComponentPromiseCache.get(iconKey);
  if (existingPromise) {
    return existingPromise;
  }

  const componentPromise = (async () => {
    const parsed = parseQuestionIconKey(iconKey);
    if (!parsed) {
      iconComponentCache.set(iconKey, null);
      return null;
    }

    const moduleExports = await getIconPackageExports(iconKey);
    if (!moduleExports) {
      iconComponentCache.set(iconKey, null);
      return null;
    }

    const component =
      moduleExports[parsed.iconName] ??
      ("default" in moduleExports ? moduleExports.default : null);
    const isValidReactComponent =
      component != null && typeof component === "function";
    if (!isValidReactComponent) {
      iconComponentCache.set(iconKey, null);
      return null;
    }

    const typedComponent = component as QuestionIconComponentType;
    iconComponentCache.set(iconKey, typedComponent);
    return typedComponent;
  })();

  iconComponentPromiseCache.set(iconKey, componentPromise);
  return componentPromise;
};

const QuestionIcon = ({
  iconKey = DEFAULT_QUESTION_ICON_KEY,
  className,
  size = 18,
}: QuestionIconProps) => {
  const [iconComponent, setIconComponent] =
    useState<QuestionIconComponentType | null>(
      () => iconComponentCache.get(iconKey) ?? null,
    );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // This flag is used to prevent the useEffect hook from updating the state after the component has been unmounted.
    let canceled = false;

    void loadQuestionIconComponent(iconKey).then((component) => {
      if (!canceled) {
        setLoading(false);
        setIconComponent(() => component);
      }
    });

    return () => {
      canceled = true;
    };
  }, [iconKey]);

  if (!iconComponent) {
    if (loading) {
      return <CircularProgress size={size} sx={{ color: "gray" }} />;
    }
    return <IoIosHelp size={size} />;
  }

  const IconComponent = iconComponent;
  return <IconComponent className={className} size={size} />;
};

export default QuestionIcon;
