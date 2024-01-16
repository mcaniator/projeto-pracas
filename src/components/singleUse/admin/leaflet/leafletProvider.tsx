"use client";

import "leaflet/dist/leaflet.css";
import { Dispatch, ReactNode, SetStateAction, createContext, useState } from "react";
import { MapContainer, TileLayer } from "react-leaflet";

const DrawingContext = createContext<{
  drawingContext: boolean;
  setDrawingContext: Dispatch<SetStateAction<boolean>>;
}>({ drawingContext: false, setDrawingContext: () => false });

const LeafletProvider = ({ children }: { children?: ReactNode }) => {
  const [drawingActive, setDrawingActive] = useState(false);

  return (
    <div className={"h-full w-full"}>
      <DrawingContext.Provider
        value={{
          drawingContext: drawingActive,
          setDrawingContext: setDrawingActive,
        }}
      >
        <MapContainer
          center={[-21.7642, -43.3496]}
          zoom={16}
          scrollWheelZoom={true}
          className={"h-full w-full rounded-tl-3xl shadow-lg"}
          touchZoom={true}
          zoomControl={false}
        >
          {children}

          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
        </MapContainer>
      </DrawingContext.Provider>
    </div>
  );
};

export { DrawingContext };
export default LeafletProvider;
