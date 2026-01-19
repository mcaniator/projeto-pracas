"use client";

import dynamic from "next/dynamic";

import PolygonsAndClientContainer from "./PolygonsAndClientContainer";

const MapProvider = dynamic(() => import("./mapProvider"), {
  ssr: false,
});

const Map = () => {
  return (
    <MapProvider>
      <PolygonsAndClientContainer />
    </MapProvider>
  );
};

export default Map;
