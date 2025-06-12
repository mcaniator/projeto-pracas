"use client";

import { Button } from "@/components/button";
import { search } from "@/lib/search";
import { FetchCitiesType } from "@/serverActions/cityUtil";
import { removePolygon } from "@/serverActions/managePolygons";
import { useLoadingOverlay } from "@components/context/loadingContext";
import CustomModal from "@components/modal/customModal";
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
import { useRef, useState } from "react";
import { useContext, useEffect, useMemo } from "react";
import type { Dispatch, SetStateAction } from "react";
import { Rnd } from "react-rnd";

import PermissionGuard from "../../../components/auth/permissionGuard";
import { useUserContext } from "../../../components/context/UserContext";
import { useHelperCard } from "../../../components/context/helperCardContext";
import { Input } from "../../../components/ui/input";
import { CreationPanel } from "./creationPanel";
import { DrawingProvider } from "./drawingProvider";
import { MapContext } from "./mapProvider";
import { PolygonProviderVectorSourceContext } from "./polygonProvider";

interface fullLocation extends Location {
  st_asgeojson: string | null;
}

const Client = ({
  locations,
  cities,
  locationCategories,
  locationTypes,
}: {
  locations: fullLocation[];
  cities: FetchCitiesType;
  locationCategories: {
    statusCode: number;
    message: string;
    categories: {
      id: number;
      name: string;
    }[];
  };
  locationTypes: {
    statusCode: number;
    message: string;
    types: {
      id: number;
      name: string;
    }[];
  };
}) => {
  const { user } = useUserContext();
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
            <span className="text-gray-700">Janela de Desenho</span>
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

                <ParkList
                  locations={locations}
                  setOriginalFeatures={setOriginalFeatures}
                  setCurrentId={setCurrentId}
                />
                <div className="mt-10"></div>
              </div>
            )}
            {currentId !== -2 && (
              <PermissionGuard requiresAnyRoles={["PARK_MANAGER"]}>
                <DrawingProvider>
                  <CreationPanel
                    originalFeatures={originalFeatures}
                    setOriginalFeatures={setOriginalFeatures}
                    currentId={currentId}
                    setCurrentId={setCurrentId}
                    drawingWindowVisible={drawingWindowVisible}
                    setDrawingWindowVisible={setDrawingWindowVisible}
                    cities={cities}
                    locationCategories={locationCategories}
                    locationTypes={locationTypes}
                  />
                </DrawingProvider>
              </PermissionGuard>
            )}
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
  const { setLoadingOverlayVisible } = useLoadingOverlay();
  const { setHelperCard } = useHelperCard();
  const [deletionModalIsOpen, setDeletionModalIsOpen] = useState(false);
  const locationToDeleteGeometry = useRef<{ id: number; name: string } | null>(
    null,
  );
  const map = useContext(MapContext);
  const view = map?.getView();
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

  const handlePolygonRemoval = async () => {
    setLoadingOverlayVisible(true);
    const id = locationToDeleteGeometry.current?.id;
    locationToDeleteGeometry.current = null;
    if (!id) return;
    const response = await removePolygon(id);
    if (response.statusCode === 200) {
      setHelperCard({
        show: true,
        helperCardType: "CONFIRM",
        content: <>Geometria removida!</>,
      });
    } else if (response.statusCode === 401) {
      setHelperCard({
        show: true,
        helperCardType: "ERROR",
        content: <>Sem permissão para remover polígonos!</>,
      });
    } else if (response.statusCode === 500) {
      setHelperCard({
        show: true,
        helperCardType: "ERROR",
        content: <>Erro ao remover polígono!</>,
      });
    }
    setDeletionModalIsOpen(false);
    setLoadingOverlayVisible(false);
  };

  useEffect(() => {
    setHay(search("", sortedLocations, fuseHaystack));
  }, [sortedLocations, fuseHaystack]);

  return (
    <div className="flex flex-col gap-2 overflow-clip pt-1">
      <Input
        onChange={(e) => {
          setHay(search(e.target.value, sortedLocations, fuseHaystack));
        }}
        placeholder="Buscar locais..."
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
                            view?.fit(geometry, {
                              duration: 1000,
                              padding: [10, 10, 10, 10],
                            });
                        }}
                        variant={"admin"}
                        size={"icon"}
                      >
                        <IconMapPin />
                      </Button>
                      <PermissionGuard requiresAnyRoles={["PARK_MANAGER"]}>
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
                      </PermissionGuard>
                      <PermissionGuard requiresAnyRoles={["PARK_MANAGER"]}>
                        <Button
                          onPress={() => {
                            locationToDeleteGeometry.current = location.item;
                            setDeletionModalIsOpen(true);
                          }}
                          variant={"destructive"}
                          size={"icon"}
                        >
                          <IconPolygonOff />
                        </Button>
                      </PermissionGuard>
                    </>
                  : <>
                      <PermissionGuard requiresAnyRoles={["PARK_MANAGER"]}>
                        <Button
                          variant={"constructive"}
                          size={"icon"}
                          onPress={() => {
                            setCurrentId(location.item.id);
                          }}
                        >
                          <IconPlus />
                        </Button>
                      </PermissionGuard>
                    </>
                  }
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <CustomModal
        isOpen={deletionModalIsOpen}
        title="Excluir geometria?"
        subtitle={locationToDeleteGeometry.current?.name}
        confirmLabel="Excluir"
        confirmVariant="destructive"
        onConfirm={() => void handlePolygonRemoval()}
        onOpenChange={(open) => {
          setDeletionModalIsOpen(open);
        }}
      />
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
