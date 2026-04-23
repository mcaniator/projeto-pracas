import type { DynamicIconPackId } from "@/lib/questionIcons/dynamicIcon";
import { addCollection, type IconifyJSON } from "@iconify/react";

type CollectionLoader = () => Promise<IconifyJSON>;

const defaultCollectionLoaders: Record<DynamicIconPackId, CollectionLoader> = {
  mdi: () => import("@iconify-json/mdi/icons.json"),
  tabler: () => import("@iconify-json/tabler/icons.json"),
  lucide: () => import("@iconify-json/lucide/icons.json"),
  ri: () => import("@iconify-json/ri/icons.json"),
};
const collectionLoaders: Record<DynamicIconPackId, CollectionLoader> = {
  ...defaultCollectionLoaders,
};

const loadedCollections = new Set<DynamicIconPackId>();
const pendingCollections = new Map<DynamicIconPackId, Promise<void>>();

const isDynamicIconPackId = (value: string): value is DynamicIconPackId =>
  value in collectionLoaders;

const getDynamicIconPackId = (icon: string): DynamicIconPackId | null => {
  const [prefix] = icon.split(":");
  if (!prefix || !isDynamicIconPackId(prefix)) {
    return null;
  }

  return prefix;
};

const ensureDynamicIconCollection = (packId: DynamicIconPackId) => {
  if (loadedCollections.has(packId)) {
    return Promise.resolve();
  }

  const existingPromise = pendingCollections.get(packId);
  if (existingPromise) {
    return existingPromise;
  }

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

const preloadAllDynamicIconCollections = () =>
  Promise.all(
    (Object.keys(collectionLoaders) as DynamicIconPackId[]).map(
      ensureDynamicIconCollection,
    ),
  ).then(() => undefined);

const isDynamicIconCollectionLoaded = (packId: DynamicIconPackId) =>
  loadedCollections.has(packId);

export {
  ensureDynamicIconCollection,
  getDynamicIconPackId,
  isDynamicIconCollectionLoaded,
  preloadAllDynamicIconCollections,
};
