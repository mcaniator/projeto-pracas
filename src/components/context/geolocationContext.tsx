"use client";

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

export const GeolocationProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [cachedUserCoordinates, setCachedUserCoordinates] =
    useState<UserCoordinates | null>(null);
  const [pendingUserLocationReads, setPendingUserLocationReads] = useState(0);

  const readUserLocation = useCallback(
    async ({
      maximumAge,
    }: ReadLocationOptions): Promise<UserCoordinates | null> => {
      if (typeof navigator === "undefined" || !navigator.geolocation) {
        return null;
      }

      return new Promise((resolve) => {
        setPendingUserLocationReads((current) => current + 1);

        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const coordinates: UserCoordinates = [
              pos.coords.longitude,
              pos.coords.latitude,
            ];
            setCachedUserCoordinates(coordinates);
            setPendingUserLocationReads((current) => Math.max(0, current - 1));
            resolve(coordinates);
          },
          () => {
            setPendingUserLocationReads((current) => Math.max(0, current - 1));
            resolve(null);
          },
          {
            enableHighAccuracy: false,
            maximumAge,
            timeout: 60000,
          },
        );
      });
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
