"use client";

import { useGeolocation } from "@/components/context/geolocationContext";
import { useAppSnackbar } from "@/lib/hooks/useAppSnackbar";
import View from "ol/View";
import { useCallback } from "react";

type CenterOnUserLocationParams = {
  view: View | null | undefined;
  zoom: number;
  duration: number;
  maximumAge: number;
  useCachedLocationImmediately?: boolean;
};

const useCenterOnUserLocation = () => {
  const { cachedUserCoordinates, readUserLocation } = useGeolocation();
  const { enqueueSnackbar } = useAppSnackbar();

  return useCallback(
    async ({
      view,
      zoom,
      duration,
      maximumAge,
      useCachedLocationImmediately = false,
    }: CenterOnUserLocationParams) => {
      if (!view) return;

      if (useCachedLocationImmediately && cachedUserCoordinates) {
        view.animate({
          center: cachedUserCoordinates,
          zoom,
          duration,
        });

        void readUserLocation({
          maximumAge,
        });
        return;
      }

      const coordinates = await readUserLocation({
        maximumAge,
      });

      if (!coordinates) {
        enqueueSnackbar("Erro ao obter sua localização!", { variant: "error" });
        return;
      }

      view.animate({
        center: coordinates,
        zoom,
        duration,
      });
    },
    [cachedUserCoordinates, readUserLocation, enqueueSnackbar],
  );
};

export default useCenterOnUserLocation;
