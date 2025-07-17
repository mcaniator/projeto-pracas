"use client";

import { Button } from "@/components/button";
import { search } from "@/lib/search";
import PermissionGuard from "@components/auth/permissionGuard";
import { useHelperCard } from "@components/context/helperCardContext";
import { useLoadingOverlay } from "@components/context/loadingContext";
import CustomModal from "@components/modal/customModal";
import { Input } from "@components/ui/input";
import { Location } from "@prisma/client";
import { removePolygon } from "@serverActions/managePolygons";
import {
  IconMapPin,
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

import { MapContext } from "./mapProvider";
import { PolygonProviderVectorSourceContext } from "./polygonProvider";

interface fullLocation extends Location {
  st_asgeojson: string | null;
}

const ParkList = ({
  setOriginalFeatures,
  setCurrentId,
  locationsPromise,
}: {
  setOriginalFeatures: Dispatch<SetStateAction<Feature<Geometry>[]>>;
  setCurrentId: Dispatch<SetStateAction<number>>;
  locationsPromise: fullLocation[];
}) => {
  const locations = locationsPromise;
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

export default ParkList;
