"use client";

import { Button } from "@/components/button";
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
import Link from "next/link";
import Feature from "ol/Feature";
import { MultiPolygon, SimpleGeometry } from "ol/geom";
import Geometry from "ol/geom/Geometry";
import { useContext, useState } from "react";
import type { Dispatch, SetStateAction } from "react";

import { CreationPanel } from "./creationPanel";
import { DrawingProvider } from "./drawingProvider";
import { MapContext } from "./mapProvider";
import { PolygonProviderVectorSourceContext } from "./polygonProvider";

interface fullLocation extends Location {
  st_asgeojson: string | null;
}

const Client = ({ locations }: { locations: fullLocation[] }) => {
  const [currentId, setCurrentId] = useState(-2); // -2 == not drawing, -1 == new park, everything else == currently edited park id
  const [originalFeatures, setOriginalFeatures] = useState<Feature<Geometry>[]>(
    [],
  );

  const [panelRef] = useAutoAnimate();

  return (
    <div>
      <div className="fixed z-50 p-2">
        <div className="h-96 rounded-2xl border-4 border-off-white bg-ugly-white p-3 shadow-lg">
          {currentId === -2 ?
            <div className="flex h-full w-full flex-col gap-2" ref={panelRef}>
              <Button
                variant={"admin"}
                onPress={() => {
                  setCurrentId(-1);
                }}
              >
                <span className="-mb-1 text-white">Iniciar Desenho</span>
              </Button>

              <hr className="w-80 rounded-full border-2 border-off-white" />

              <ParkList
                locations={locations}
                setOriginalFeatures={setOriginalFeatures}
                setCurrentId={setCurrentId}
              />
            </div>
          : <div>
              <DrawingProvider>
                <CreationPanel
                  originalFeatures={originalFeatures}
                  setOriginalFeatures={setOriginalFeatures}
                  currentId={currentId}
                  setCurrentId={setCurrentId}
                />
              </DrawingProvider>
            </div>
          }
        </div>
      </div>

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
  const sortedLocations = locations.toSorted((a, b) => {
    if (a.name === b.name) return 0;
    else if (a.name > b.name) return 1;
    else return -1;
  });

  return (
    <div className="flex max-w-80 flex-col gap-2 overflow-scroll text-white">
      {sortedLocations.map((location, index) => {
        return (
          <div key={index} className="flex items-center gap-2">
            <div className="w-full">
              <Link href={`/admin/parks/${location.id}`}>
                <p className="-mb-1 overflow-hidden overflow-ellipsis whitespace-nowrap text-xl hover:underline">
                  {location.name}
                </p>
              </Link>
            </div>

            <div className="ml-auto flex gap-2">
              {location.st_asgeojson !== null ?
                <>
                  <Button
                    onPress={() => {
                      const feature = vectorSource.getFeatureById(location.id);
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
                      const feature = vectorSource.getFeatureById(location.id);
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
                      setCurrentId(location.id);

                      vectorSource.removeFeature(feature);
                    }}
                  >
                    <IconPolygon />
                  </Button>
                  <Button
                    onPress={() => void removePolygon(location.id)}
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
                      setCurrentId(location.id);
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
