"use client";

import { useEffect } from "react";

import { preloadAllDynamicIconCollections } from "./dynamicIconLoader";

const DynamicIconPreloader = () => {
  useEffect(() => {
    const startPreload = () => {
      void preloadAllDynamicIconCollections().catch(() => undefined);
    };

    if (document.readyState === "complete") {
      startPreload();
      return;
    }

    window.addEventListener("load", startPreload, { once: true });

    return () => {
      window.removeEventListener("load", startPreload);
    };
  }, []);

  return null;
};

export default DynamicIconPreloader;
