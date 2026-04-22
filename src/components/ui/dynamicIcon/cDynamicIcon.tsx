"use client";

import { DEFAULT_DYNAMIC_ICON_KEY } from "@/lib/questionIcons/dynamicIcon";
import loadingLoop from "@iconify/icons-line-md/loading-loop";
import { Icon } from "@iconify/react";
import { useEffect, useMemo, useState } from "react";

import {
  ensureDynamicIconCollection,
  getDynamicIconPackId,
  isDynamicIconCollectionLoaded,
} from "./dynamicIconLoader";

const CDynamicIcon = ({ iconKey }: { iconKey?: string | null }) => {
  const resolvedKey = iconKey ?? DEFAULT_DYNAMIC_ICON_KEY;
  const packId = useMemo(() => getDynamicIconPackId(resolvedKey), [resolvedKey]);
  const [isReady, setIsReady] = useState(() =>
    !packId ? true : isDynamicIconCollectionLoaded(packId),
  );

  useEffect(() => {
    let cancelled = false;

    if (!packId) {
      setIsReady(true);
      return () => {
        cancelled = true;
      };
    }

    if (isDynamicIconCollectionLoaded(packId)) {
      setIsReady(true);
      return () => {
        cancelled = true;
      };
    }

    setIsReady(false);
    void ensureDynamicIconCollection(packId)
      .then(() => {
        if (!cancelled) setIsReady(true);
      })
      .catch(() => {
        if (!cancelled) {
          setIsReady(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [packId]);

  return <Icon icon={isReady ? resolvedKey : loadingLoop} />;
};

export default CDynamicIcon;
