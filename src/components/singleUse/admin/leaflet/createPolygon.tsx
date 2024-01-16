"use client";

import { DrawingContext } from "@/components/singleUse/admin/leaflet/leafletProvider";
import { PolygonSubmissionForm } from "@/components/singleUse/admin/leaflet/polygonSubmissionForm";
import { Button } from "@/components/ui/button";
import { josefin_sans } from "@/lib/fonts";
import { Dispatch, SetStateAction, createContext, useContext, useState } from "react";
import { Polygon, useMapEvents } from "react-leaflet";
import Control from "react-leaflet-custom-control";

const PolygonContext = createContext<{
  polygonContext: { lat: number; lng: number }[];
  setPolygonContext: Dispatch<SetStateAction<{ lat: number; lng: number }[]>>;
}>({ polygonContext: [], setPolygonContext: () => [] });

const CreatePolygon = () => {
  const { drawingContext, setDrawingContext } = useContext(DrawingContext);
  const [currentPolygon, setCurrentPolygon] = useState<
    {
      lat: number;
      lng: number;
    }[]
  >([]);

  useMapEvents({
    click: (mouseEvent) => {
      setCurrentPolygon([...currentPolygon, { lat: mouseEvent.latlng.lat, lng: mouseEvent.latlng.lng }]);
    },
  });

  return (
    <div>
      <div>
        <Control position={"topleft"}>
          <Button
            variant={"admin"}
            onClick={() => {
              setDrawingContext(!drawingContext);
              setCurrentPolygon([]);
            }}
            className={josefin_sans.className + " text-white"}
          >
            <span className={"-mb-1"}>{!drawingContext ? "Criar Polígono" : "Descartar Polígono"}</span>
          </Button>
        </Control>

        <PolygonContext.Provider
          value={{
            polygonContext: currentPolygon,
            setPolygonContext: setCurrentPolygon,
          }}
        >
          {/**
           * Gambiarra para esconder o botão dependendo do estado
           * O React-Leaflet não expõe os componentes diretamente para a Virtual DOM do React, portanto
           * eles não podem ser dinamicamente removidos/inseridos, assim o children do elemento que
           * deve ser ocultado
           **/}
          <Control position={"topleft"}>{drawingContext && <PolygonSubmissionForm />}</Control>
        </PolygonContext.Provider>
      </div>

      {drawingContext ?
        <Polygon positions={currentPolygon} color={"#E7A1FF"} />
      : null}
    </div>
  );
};

export { CreatePolygon, PolygonContext };
