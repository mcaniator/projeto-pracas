"use client";

import LoadingIcon from "@components/LoadingIcon";
import dynamic from "next/dynamic";
import { Suspense } from "react";

import PolygonsAndClientContainer from "./PolygonsAndClientContainer";

const MapProvider = dynamic(() => import("./mapProvider"), {
  ssr: false,
});

const Map = () => {
  return (
    <MapProvider>
      <Suspense
        fallback={
          <div className="fixed left-0 top-0 z-50 flex h-full w-full flex-col items-center justify-center bg-black bg-opacity-50 text-lg">
            <LoadingIcon size={32} />
            Carregando filtros...
          </div>
        }
      >
        <PolygonsAndClientContainer />
      </Suspense>
    </MapProvider>
  );
};

export default Map;
