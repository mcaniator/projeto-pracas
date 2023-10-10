"use client";

import { DrawingContext } from "@/app/admin/leaflet/elements/leafletProvider";
import { DrawingElement } from "@/app/admin/leaflet/elements/pseudo-elements/drawingElement";
import { PolygonSubmissionForm } from "@/app/admin/leaflet/elements/pseudo-elements/polygonSubmissionForm";
import { josefin_sans } from "@/app/fonts";
import { Button } from "@/components/ui/button";
import {
  Dispatch,
  SetStateAction,
  createContext,
  useContext,
  useState,
} from "react";
import Control from "react-leaflet-custom-control";

export const PolygonContext = createContext<{
  polygonContext: { lat: number; lng: number }[] | null;
  setPolygonContext: Dispatch<
    SetStateAction<{ lat: number; lng: number }[] | null>
  >;
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
        {/* Gambiarra para esconder o botão dependendo do estado
            O React-Leaflet não expõe os componentes diretamente para a Virtual DOM do React, portanto
            eles não podem ser dinamicamente removidos/inseridos, assim o children do elemento que
            deve ser ocultado */}
        <Control position={"topleft"}>
          {!drawingContext && (
            <Button
              onClick={() => {
                setDrawingContext(true);
              }}
              className={josefin_sans.className}
            >
              Criar Polígono
            </Button>
          )}
        </Control>

        <PolygonContext.Provider
          value={{
            polygonContext: currentPolygon,
            setPolygonContext: setCurrentPolygon,
          }}
        >
          <Control position={"topleft"}>
            {drawingContext && <PolygonSubmissionForm />}
          </Control>
        </PolygonContext.Provider>

        <Control position={"topleft"}>
          {drawingContext && (
            <Button
              onClick={() => {
                setDrawingContext(false);
                setCurrentPolygon(null);
              }}
              className={josefin_sans.className}
            >
              Descartar Polígono
            </Button>
          )}
        </Control>

        <Control position={"topright"}></Control>
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

export default CreatePolygon;
