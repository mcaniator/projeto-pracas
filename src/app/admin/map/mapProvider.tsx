"use client";

import { useHelperCard } from "@/components/context/helperCardContext";
import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import "ol/ol.css";
import { useGeographic } from "ol/proj";
import OSM from "ol/source/OSM";
import { ReactNode, createContext, useEffect, useMemo, useRef } from "react";

const MapContext = createContext<null | Map>(null);

const MapProvider = ({ children }: { children: ReactNode }) => {
  useGeographic();
  const { setHelperCard } = useHelperCard();

  const ref = useRef<HTMLDivElement>(null);

  const map = useMemo(
    () =>
      new Map({
        target: "map",
        layers: [new TileLayer({ source: new OSM() })],
        view: new View({ center: [0, 0], zoom: 2 }),
        controls: [],
      }),
    [],
  );
  const view = map?.getView();

  useEffect(() => {
    if (ref.current !== null) map?.setTarget(ref.current);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        view?.animate({
          center: [pos.coords.longitude, pos.coords.latitude],
          zoom: 16,
          duration: 0,
        });
      },
      () => {
        setHelperCard({
          show: true,
          helperCardType: "ERROR",
          content: <>Erro ao obter sua localização!</>,
        });
      },
      {
        enableHighAccuracy: false,
        maximumAge: Infinity,
        timeout: 60000,
      },
    );
  }, [map, view, setHelperCard]);

  return (
    <div
      id="map"
      className={
        "animate-map-bg-pulse relative h-full w-full max-w-[100vw] overflow-hidden"
      }
      ref={ref}
    >
      <MapContext.Provider value={map}>{children}</MapContext.Provider>
    </div>
  );
};

export { MapContext };
export default MapProvider;
