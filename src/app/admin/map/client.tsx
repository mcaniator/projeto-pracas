"use client";

import { Button } from "@/components/button";
import PermissionGuard from "@components/auth/permissionGuard";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { Location } from "@prisma/client";
import { FetchCitiesType } from "@queries/city";
import { IconLocationPin, IconMinus, IconPlus } from "@tabler/icons-react";
import Feature from "ol/Feature";
import Geometry from "ol/geom/Geometry";
import { Suspense, useState } from "react";
import { useContext } from "react";
import { Rnd } from "react-rnd";

import ParkList from "./ParkList";
import { CreationPanel } from "./creationPanel";
import { DrawingProvider } from "./drawingProvider";
import { MapContext } from "./mapProvider";

interface fullLocation extends Location {
  st_asgeojson: string | null;
}

const Client = ({
  locationsPromise,
  citiesPromise,
  locationCategoriesPromise,
  locationTypesPromise,
}: {
  locationsPromise: fullLocation[];
  citiesPromise: Promise<FetchCitiesType>;
  locationCategoriesPromise: Promise<{
    statusCode: number;
    message: string;
    categories: {
      id: number;
      name: string;
    }[];
  }>;
  locationTypesPromise: Promise<{
    statusCode: number;
    message: string;
    types: {
      id: number;
      name: string;
    }[];
  }>;
}) => {
  const [currentId, setCurrentId] = useState(-2);
  const [originalFeatures, setOriginalFeatures] = useState<Feature<Geometry>[]>(
    [],
  );
  const [panelVisible, setPanelVisible] = useState(false);
  const [drawingWindowVisible, setDrawingWindowVisible] = useState(false);
  const [panelRef] = useAutoAnimate();
  return (
    <div className="relative">
      <div className="fixed bottom-4 right-4 z-[60]">
        <Button
          onPress={() => {
            setPanelVisible(!panelVisible);
            setDrawingWindowVisible(!drawingWindowVisible);
          }}
          variant="admin"
          className="bg-blue-600"
        >
          {panelVisible ? "Esconder" : "Menu"}
        </Button>
      </div>
      {panelVisible && (
        <Rnd
          default={{
            x: 100,
            y: 100,
            width: 320,
            height: 480,
          }}
          bounds="window"
          dragHandleClassName="drag-handle"
          className={`${
            !drawingWindowVisible ? "hidden" : (
              "z-10 overflow-hidden rounded-lg border border-gray-300 bg-ugly-white shadow-lg"
            )
          }`}
          minWidth={150}
          minHeight={250}
          maxHeight={window.innerHeight - 50}
          //   máxima
        >
          <div
            className={`${
              !drawingWindowVisible ? "hidden" : (
                "drag-handle flex-shrink-0 cursor-move rounded-t-lg bg-gray-200 p-2"
              )
            }`}
          >
            <span className="text-gray-700">Menu</span>
          </div>

          <div
            className={`${
              !drawingWindowVisible ? "hidden" : (
                "flex h-full flex-1 flex-col gap-2 overflow-auto p-4"
              )
            }`}
          >
            {currentId === -2 && (
              <div className="flex flex-col gap-2" ref={panelRef}>
                <PermissionGuard requiresAnyRoles={["TALLY_MANAGER"]}>
                  <Button
                    variant="admin"
                    onPress={() => {
                      setCurrentId(-1);
                    }}
                  >
                    <span className="-mb-1">Iniciar Criação</span>
                  </Button>

                  <hr className="w-full rounded-full border-2 border-off-white" />
                </PermissionGuard>
                <Suspense>
                  <ParkList
                    locationsPromise={locationsPromise}
                    setOriginalFeatures={setOriginalFeatures}
                    setCurrentId={setCurrentId}
                  />
                </Suspense>

                <div className="mt-10"></div>
              </div>
            )}
            {currentId !== -2 && (
              <PermissionGuard requiresAnyRoles={["PARK_MANAGER"]}>
                <Suspense fallback={<div>Carregando...</div>}>
                  <DrawingProvider>
                    <CreationPanel
                      originalFeatures={originalFeatures}
                      setOriginalFeatures={setOriginalFeatures}
                      currentId={currentId}
                      setCurrentId={setCurrentId}
                      drawingWindowVisible={drawingWindowVisible}
                      setDrawingWindowVisible={setDrawingWindowVisible}
                      citiesPromise={citiesPromise}
                      locationCategoriesPromise={locationCategoriesPromise}
                      locationTypesPromise={locationTypesPromise}
                    />
                  </DrawingProvider>
                </Suspense>
              </PermissionGuard>
            )}
          </div>
        </Rnd>
      )}
      <BottomControls />
    </div>
  );
};

const BottomControls = () => {
  const map = useContext(MapContext);
  const view = map?.getView();

  return (
    <div className="fixed bottom-2 z-40 flex flex-col gap-1 p-2 pb-0">
      <Button
        type="button"
        size={"icon"}
        variant={"admin"}
        onPress={() => {
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              view?.animate({
                center: [pos.coords.longitude, pos.coords.latitude],
                zoom: 17,
                duration: 1000,
              });
            },
            null,
            {
              enableHighAccuracy: false,
              maximumAge: Infinity,
              timeout: 60000,
            },
          );
        }}
      >
        <IconLocationPin />
      </Button>

      <div className="flex gap-1">
        <Button
          type="button"
          size={"icon"}
          variant={"admin"}
          onPress={() => {
            const zoom = view?.getZoom();

            view?.animate({
              zoom: zoom !== undefined ? zoom + 1 : 0,
              duration: 500,
            });
          }}
        >
          <IconPlus />
        </Button>
        <Button
          type="button"
          size={"icon"}
          variant={"admin"}
          onPress={() => {
            const zoom = view?.getZoom();

            view?.animate({
              zoom: zoom !== undefined ? zoom - 1 : 0,
              duration: 500,
            });
          }}
        >
          <IconMinus />
        </Button>
      </div>
    </div>
  );
};

export default Client;
