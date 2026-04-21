"use client";

import { useGeolocation } from "@/components/context/geolocationContext";
import { useHelperCard } from "@/components/context/helperCardContext";
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
  const { setHelperCard } = useHelperCard();

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
          duration: 150,
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
        setHelperCard({
          show: true,
          helperCardType: "ERROR",
          content: "Erro ao obter sua localização!",
        });
        return;
      }

      view.animate({
        center: coordinates,
        zoom,
        duration,
      });
    },
    [cachedUserCoordinates, readUserLocation, setHelperCard],
  );
};

export default useCenterOnUserLocation;
