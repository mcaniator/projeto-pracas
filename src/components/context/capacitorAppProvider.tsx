"use client";

import { App as CapacitorApp } from "@capacitor/app";
import { Capacitor } from "@capacitor/core";
import { LocalNotifications } from "@capacitor/local-notifications";
import { ReactNode, useEffect } from "react";

type CapacitorAppProviderProps = {
  children: ReactNode;
};

const CapacitorAppProvider = ({ children }: CapacitorAppProviderProps) => {
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) {
      return;
    }

    let listenerHandle: { remove: () => Promise<void> } | undefined;
    let isMounted = true;

    const registerListener = async () => {
      const handle = await CapacitorApp.addListener("backButton", () => {
        if (window.history.length > 1) {
          window.history.back();
          return;
        }

        void CapacitorApp.minimizeApp();
      });

      if (!isMounted) {
        void handle.remove();
        return;
      }

      listenerHandle = handle;
    };

    const checkNotifcationPermissions = async () => {
      const permissions = await LocalNotifications.checkPermissions();

      if (permissions.display === "granted") {
        return;
      }

      await LocalNotifications.requestPermissions();
    };

    void checkNotifcationPermissions();
    void registerListener();

    return () => {
      isMounted = false;

      if (listenerHandle) {
        void listenerHandle.remove();
      }
    };
  }, []);

  return <>{children}</>;
};

export default CapacitorAppProvider;
