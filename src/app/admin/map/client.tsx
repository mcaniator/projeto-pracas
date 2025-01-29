"use client";

import { Button } from "@/components/button";
import { Input } from "@/components/input";
import { search } from "@/lib/search";
import { removePolygon } from "@/serverActions/managePolygons";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { Location } from "@prisma/client";
import {
  IconLocationPin,
  IconMapPin,
  IconMinus,
  IconPlus,
  IconPolygon,
  IconPolygonOff,
} from "@tabler/icons-react";
import Fuse from "fuse.js";
import Link from "next/link";
import Feature from "ol/Feature";
import { MultiPolygon, SimpleGeometry } from "ol/geom";
import Geometry from "ol/geom/Geometry";
import { useState } from "react";
import { useContext, useEffect, useMemo } from "react";
import type { Dispatch, SetStateAction } from "react";
import { Rnd } from "react-rnd";

import { CreationPanel } from "./creationPanel";
import { DrawingProvider } from "./drawingProvider";
import { MapContext } from "./mapProvider";
import { PolygonProviderVectorSourceContext } from "./polygonProvider";

interface fullLocation extends Location {
  st_asgeojson: string | null;
}

const Client = ({ locations }: { locations: fullLocation[] }) => {
  const [currentId, setCurrentId] = useState(-2);
  const [originalFeatures, setOriginalFeatures] = useState<Feature<Geometry>[]>(
    [],
  );
  const [panelVisible, setPanelVisible] = useState(false);
  const [drawingWindowVisible, setDrawingWindowVisible] = useState(false);
  const [panelRef] = useAutoAnimate();

  return (
    <div className="relative">
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onPress={() => {
            setPanelVisible(!panelVisible);
            setDrawingWindowVisible(!drawingWindowVisible);
          }}
          variant="admin"
          className="bg-blue-600 text-white"
        >
          {panelVisible ? "Esconder" : "Criar"}
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
              "rounded-lg border border-gray-300 bg-ugly-white shadow-lg"
            )
          }`}
          style={{
            zIndex: 100,
          }}
          minWidth={150}
          minHeight={250}
          maxHeight={window.innerHeight - 50} // Ajusta dinamicamente a altura máxima
        >
          <div
            className={`${
              !drawingWindowVisible ? "hidden" : (
                "drag-handle cursor-move rounded-t-lg bg-gray-200 p-2"
              )
            }`}
          >
            <span className="text-gray-700">Janela de Desenho</span>
          </div>

          <div
            className={`${
              !drawingWindowVisible ? "hidden" : (
                "flex h-full max-h-[430px] flex-col gap-2 overflow-auto p-4"
              )
            }`}
          >
            {currentId === -2 && (
              <div className="flex flex-col gap-2" ref={panelRef}>
                <Button
                  variant="admin"
                  onPress={() => {
                    setCurrentId(-1);
                  }}
                >
                  <span className="-mb-1 text-white">Iniciar Criação</span>
                </Button>

                <hr className="w-full rounded-full border-2 border-off-white" />

                <ParkList
                  locations={locations}
                  setOriginalFeatures={setOriginalFeatures}
                  setCurrentId={setCurrentId}
                />
              </div>
            )}

            <DrawingProvider>
              <CreationPanel
                originalFeatures={originalFeatures}
                setOriginalFeatures={setOriginalFeatures}
                currentId={currentId}
                setCurrentId={setCurrentId}
                setDrawingWindowVisible={setDrawingWindowVisible}
              />
            </DrawingProvider>
          </div>
        </Rnd>
      )}
      <BottomControls />
    </div>
  );
};

const ParkList = ({
  setOriginalFeatures,
  setCurrentId,
  locations,
}: {
  setOriginalFeatures: Dispatch<SetStateAction<Feature<Geometry>[]>>;
  setCurrentId: Dispatch<SetStateAction<number>>;
  locations: fullLocation[];
}) => {
  const map = useContext(MapContext);
  const view = map.getView();
  const vectorSource = useContext(PolygonProviderVectorSourceContext);
  const sortedLocations = useMemo(
    () =>
      locations.toSorted((a, b) => {
        if (a.name === b.name) return 0;
        else if (a.name > b.name) return 1;
        else return -1;
      }),
    [locations],
  );
  const fuseHaystack = useMemo(
    () => new Fuse(sortedLocations, { keys: ["name"] }),
    [sortedLocations],
  );
  const [hay, setHay] = useState(search("", sortedLocations, fuseHaystack));

  useEffect(() => {
    setHay(search("", sortedLocations, fuseHaystack));
  }, [sortedLocations, fuseHaystack]);

  return (
    <div className="flex flex-col gap-2 overflow-clip pt-1 text-white">
      <Input
        onChange={(value) => {
          setHay(search(value, sortedLocations, fuseHaystack));
        }}
        // label={"Busca"}
      />

      <div className="overflow-scroll">
        <div className="flex flex-col gap-2">
          {hay.map((location, index) => {
            return (
              <div key={index} className="flex w-full items-center gap-2">
                <div className="w-full">
                  <Link href={`/admin/parks/${location.item.id}`}>
                    <p className="-mb-2 overflow-hidden overflow-ellipsis whitespace-nowrap text-xl hover:underline">
                      {location.item.name}
                    </p>
                  </Link>
                </div>

                <div className="ml-auto flex gap-2">
                  {location.item.st_asgeojson !== null ?
                    <>
                      <Button
                        onPress={() => {
                          const feature = vectorSource.getFeatureById(
                            location.item.id,
                          );
                          if (feature === null)
                            throw new Error(
                              "Feature is currently null when it shouldn't be",
                            );

                          const geometry = feature.getGeometry();

                          if (
                            geometry !== undefined &&
                            geometry instanceof SimpleGeometry
                          )
                            view.fit(geometry, {
                              duration: 1000,
                              padding: [10, 10, 10, 10],
                            });
                        }}
                        variant={"admin"}
                        size={"icon"}
                      >
                        <IconMapPin />
                      </Button>
                      <Button
                        variant={"admin"}
                        size={"icon"}
                        onPress={() => {
                          const feature = vectorSource.getFeatureById(
                            location.item.id,
                          );
                          if (feature === null)
                            throw new Error(
                              "Feature is currently null when it shouldn't be",
                            );

                          const geometry = feature.getGeometry();

                          if (!(geometry instanceof MultiPolygon))
                            throw new Error(
                              "Received geometry is not of MultiPolygon type",
                            );

                          const polygons = geometry.getPolygons();
                          const features = polygons.map((polygon) => {
                            const feature = new Feature(polygon);
                            feature.set("name", geometry.get("name"));

                            return feature;
                          });

                          setOriginalFeatures(features);
                          setCurrentId(location.item.id);

                          vectorSource.removeFeature(feature);
                        }}
                      >
                        <IconPolygon />
                      </Button>
                      <Button
                        onPress={() => void removePolygon(location.item.id)}
                        variant={"destructive"}
                        size={"icon"}
                      >
                        <IconPolygonOff />
                      </Button>
                    </>
                  : <>
                      <Button
                        variant={"constructive"}
                        size={"icon"}
                        onPress={() => {
                          setCurrentId(location.item.id);
                        }}
                      >
                        <IconPlus />
                      </Button>
                    </>
                  }
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const BottomControls = () => {
  const map = useContext(MapContext);
  const view = map.getView();

  return (
    <div className="fixed bottom-2 z-50 flex flex-col gap-1 p-2 pb-0">
      <Button
        type="button"
        className="text-white"
        size={"icon"}
        variant={"admin"}
        onPress={() => {
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              view.animate({
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
          className="text-white"
          size={"icon"}
          variant={"admin"}
          onPress={() => {
            const zoom = view.getZoom();

            view.animate({
              zoom: zoom !== undefined ? zoom + 1 : 0,
              duration: 500,
            });
          }}
        >
          <IconPlus />
        </Button>
        <Button
          type="button"
          className="text-white"
          size={"icon"}
          variant={"admin"}
          onPress={() => {
            const zoom = view.getZoom();

            view.animate({
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
