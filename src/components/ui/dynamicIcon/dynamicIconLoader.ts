import { type DynamicIconPackId } from "@/lib/questionIcons/dynamicIcon";
import { FetchCustomDynamicIconsResponse } from "@/lib/serverFunctions/queries/customDynamicIcon";
import { APIResponse } from "@/lib/types/backendCalls/APIResponse";
import { type IconifyJSON, addCollection } from "@iconify/react";
import superjson from "superjson";

type CollectionLoader = () => Promise<IconifyJSON>;

const defaultCollectionLoaders: Record<DynamicIconPackId, CollectionLoader> = {
  mdi: () => import("@iconify-json/mdi/icons.json"),
  tabler: () => import("@iconify-json/tabler/icons.json"),
  lucide: () => import("@iconify-json/lucide/icons.json"),
  ri: () => import("@iconify-json/ri/icons.json"),
  custom: async () => {
    const icons = await fetchCustomDynamicIconsCollection();
    return icons;
  },
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

// #region Custom Icons
const fetchCustomDynamicIconsCollection = async () => {
  // TODO: Load from SQLite when offline
  const customIconsResponse = await fetch("/api/customIcons");
  const jsonText = await customIconsResponse.text();
  const json =
    superjson.parse<APIResponse<FetchCustomDynamicIconsResponse>>(jsonText);
  if (!json || !json.data || !json.data.icons) {
    throw new Error();
  }
  return json.data.icons;
};

const fetchAndAddCustomDynamicIconCollection = async () => {
  // This funcion is meant to reload the custom dynamic icon pack after it has been updated on the server.
  // It should not be called  on page load, as the initial custom dynamic icon pack will be loaded by preloadAllDynamicIconCollections.

  const icons = await fetchCustomDynamicIconsCollection();
  addCollection(icons);
};

// #endregion
export {
  ensureDynamicIconCollection,
  getDynamicIconPackId,
  isDynamicIconCollectionLoaded,
  preloadAllDynamicIconCollections,
  fetchAndAddCustomDynamicIconCollection,
};
