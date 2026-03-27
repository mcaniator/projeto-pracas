"use client";

import {
  DEFAULT_DYNAMIC_ICON_KEY,
  DynamicIconPackId,
} from "@/lib/questionIcons/dynamicIcon";
import loadingLoop from "@iconify/icons-line-md/loading-loop";
import { Icon, IconifyJSON, addCollection } from "@iconify/react";
import { useEffect, useMemo, useState } from "react";

const collectionLoaders: Record<DynamicIconPackId, () => Promise<IconifyJSON>> =
  {
    mdi: () => import("@iconify-json/mdi/icons.json"),
    tabler: () => import("@iconify-json/tabler/icons.json"),
    lucide: () => import("@iconify-json/lucide/icons.json"),
    ri: () => import("@iconify-json/ri/icons.json"),
  };

const loadedCollections = new Set<DynamicIconPackId>();
const pendingCollections = new Map<DynamicIconPackId, Promise<void>>();

const getPackId = (icon: string): DynamicIconPackId | null => {
  const [prefix] = icon.split(":");
  if (prefix && prefix in collectionLoaders) {
    return prefix as DynamicIconPackId;
  }
  return null;
};

const ensureCollection = (packId: DynamicIconPackId) => {
  if (loadedCollections.has(packId)) {
    return Promise.resolve();
  }

  const existing = pendingCollections.get(packId);
  if (existing) return existing;

  const loadPromise = collectionLoaders[packId]()
    .then((collection) => {
      addCollection(collection);
      loadedCollections.add(packId);
      pendingCollections.delete(packId);
    })
    .catch((error) => {
      pendingCollections.delete(packId);
      throw error;
    });

  pendingCollections.set(packId, loadPromise);
  return loadPromise;
};

const CDynamicIcon = ({ iconKey }: { iconKey?: string | null }) => {
  const resolvedKey = iconKey ?? DEFAULT_DYNAMIC_ICON_KEY;
  const packId = useMemo(() => getPackId(resolvedKey), [resolvedKey]);
  const [isReady, setIsReady] = useState(() =>
    !packId ? true : loadedCollections.has(packId),
  );

  useEffect(() => {
    let cancelled = false;

    if (!packId) {
      setIsReady(true);
      return () => {
        cancelled = true;
      };
    }

    if (loadedCollections.has(packId)) {
      setIsReady(true);
      return () => {
        cancelled = true;
      };
    }

    setIsReady(false);
    void ensureCollection(packId)
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
