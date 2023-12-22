"use client";

import { DrawingElement } from "@/components/singleUse/admin/leaflet/drawingElement";
import { DrawingContext } from "@/components/singleUse/admin/leaflet/leafletProvider";
import { PolygonSubmissionForm } from "@/components/singleUse/admin/leaflet/polygonSubmissionForm";
import { Button } from "@/components/ui/button";
import { josefin_sans } from "@/lib/fonts";
import { Dispatch, SetStateAction, createContext, useContext, useState } from "react";
import Control from "react-leaflet-custom-control";

export const PolygonContext = createContext<{
  polygonContext: { lat: number; lng: number }[] | null;
  setPolygonContext: Dispatch<SetStateAction<{ lat: number; lng: number }[] | null>>;
}>({ polygonContext: null, setPolygonContext: () => null });

const CreatePolygon = () => {
  const { drawingContext, setDrawingContext } = useContext(DrawingContext);
  const [currentPolygon, setCurrentPolygon] = useState<
    | {
        lat: number;
        lng: number;
      }[]
    | null
  >(null);

  return (
    <div>
      <div>
        <Control position={"topleft"}>
          <Button
            variant={"admin"}
            onClick={() => {
              setDrawingContext(!drawingContext);
              if (!drawingContext) setCurrentPolygon(null);
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
          {/* Gambiarra para esconder o botão dependendo do estado
            O React-Leaflet não expõe os componentes diretamente para a Virtual DOM do React, portanto
            eles não podem ser dinamicamente removidos/inseridos, assim o children do elemento que
            deve ser ocultado */}
          <Control position={"topleft"}>{drawingContext && <PolygonSubmissionForm />}</Control>
        </PolygonContext.Provider>
      </div>

      {drawingContext && (
        <PolygonContext.Provider
          value={{
            polygonContext: currentPolygon,
            setPolygonContext: setCurrentPolygon,
          }}
        >
          <DrawingElement />
        </PolygonContext.Provider>
      )}
    </div>
  );
};

export { CreatePolygon };
