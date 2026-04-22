"use client";

import { useEffect } from "react";

import { preloadAllDynamicIconCollections } from "./dynamicIconLoader";

const DynamicIconPreloader = () => {
  useEffect(() => {
    void preloadAllDynamicIconCollections().catch(() => undefined);
  }, []);

  return null;
};

export default DynamicIconPreloader;
