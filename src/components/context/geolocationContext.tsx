"use client";

import { Capacitor } from "@capacitor/core";
import { Geolocation } from "@capacitor/geolocation";
import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

type UserCoordinates = [number, number];

type ReadLocationOptions = {
  maximumAge: number;
};

type GeolocationContextType = {
  cachedUserCoordinates: UserCoordinates | null;
  isReadingUserLocation: boolean;
  readUserLocation: (
    options: ReadLocationOptions,
  ) => Promise<UserCoordinates | null>;
};

const GeolocationContext = createContext<GeolocationContextType | undefined>(
  undefined,
);

export const GeolocationProvider = ({ children }: { children: ReactNode }) => {
  const [cachedUserCoordinates, setCachedUserCoordinates] =
    useState<UserCoordinates | null>(null);
  const [pendingUserLocationReads, setPendingUserLocationReads] = useState(0);

  const readUserLocation = useCallback(
    async ({
      maximumAge,
    }: ReadLocationOptions): Promise<UserCoordinates | null> => {
      if (Capacitor.isNativePlatform()) {
        setPendingUserLocationReads((current) => current + 1);

        try {
          const position = await Geolocation.getCurrentPosition({
            enableHighAccuracy: true,
            maximumAge,
            timeout: 60000,
          });
          const coordinates: UserCoordinates = [
            position.coords.longitude,
            position.coords.latitude,
          ];
          setCachedUserCoordinates(coordinates);
          return coordinates;
        } catch {
          return null;
        } finally {
          setPendingUserLocationReads((current) => Math.max(0, current - 1));
        }
      }

      if (typeof navigator === "undefined" || !navigator.geolocation) {
        return null;
      }

      setPendingUserLocationReads((current) => current + 1);

      try {
        const position = await new Promise<GeolocationPosition>(
          (resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              enableHighAccuracy: true,
              maximumAge,
              timeout: 60000,
            });
          },
        );
        const coordinates: UserCoordinates = [
          position.coords.longitude,
          position.coords.latitude,
        ];
        setCachedUserCoordinates(coordinates);
        return coordinates;
      } catch {
        return null;
      } finally {
        setPendingUserLocationReads((current) => Math.max(0, current - 1));
      }
    },
    [],
  );

  const value = useMemo(
    () => ({
      cachedUserCoordinates,
      isReadingUserLocation: pendingUserLocationReads > 0,
      readUserLocation,
    }),
    [cachedUserCoordinates, pendingUserLocationReads, readUserLocation],
  );

  return (
    <GeolocationContext.Provider value={value}>
      {children}
    </GeolocationContext.Provider>
  );
};

export const useGeolocation = () => {
  const context = useContext(GeolocationContext);
  if (!context) {
    throw new Error("useGeolocation must be used within a GeolocationProvider");
  }
  return context;
};
