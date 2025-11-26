"use client";

import { Button } from "@/components/button";
import { useHelperCard } from "@components/context/helperCardContext";
import { useLoadingOverlay } from "@components/context/loadingContext";
import { _editLocationPolygon } from "@serverActions/locationUtil";
import { removePolygon } from "@serverActions/managePolygons";
import Feature from "ol/Feature";
import GeoJSON from "ol/format/GeoJSON";
import { Geometry, MultiPolygon, SimpleGeometry } from "ol/geom";
import { Dispatch, SetStateAction, useEffect, useState } from "react";

const EditPolygonSubmitButton = ({
  id,
  features,
  setOriginalFeature,
  setCurrentId,
  fetchLocations,
}: {
  id: number;
  features: Feature<Geometry>[];
  setOriginalFeature: Dispatch<SetStateAction<Feature<Geometry>[]>>;
  setCurrentId: Dispatch<SetStateAction<number>>;
  fetchLocations: () => Promise<void>;
}) => {
  const { setHelperCard } = useHelperCard();
  const [state, setState] = useState<
    "normal" | "loading" | "success" | "error"
  >("normal");

  const { setLoadingOverlayVisible } = useLoadingOverlay();

  useEffect(() => {
    switch (state) {
      case "success":
        setOriginalFeature([]);

        setCurrentId(-2);

        setLoadingOverlayVisible(false);
        void fetchLocations();
        break;
      case "error":
        setState("normal");

        setLoadingOverlayVisible(false);

        break;

      case "loading":
        setLoadingOverlayVisible(true);
        break;
    }
  }, [
    state,
    setOriginalFeature,
    setCurrentId,
    setLoadingOverlayVisible,
    fetchLocations,
  ]);

  return (
    <div>
      <Button
        onPress={() => {
          if (features.length === 0) {
            removePolygon(id)
              .then(() => {
                setHelperCard({
                  show: true,
                  helperCardType: "CONFIRM",
                  content: <>Geometria removida!</>,
                });
                setState("success");
              })
              .catch(() => {
                setHelperCard({
                  show: true,
                  helperCardType: "ERROR",
                  content: <>Erro ao remover geometria!</>,
                });
                setState("error");
              });
          } else {
            const coordinates: number[][][][] = [];

            for (const feature of features) {
              const geometry = feature.getGeometry();

              if (
                geometry instanceof SimpleGeometry &&
                Geometry !== undefined
              ) {
                coordinates.push(geometry.getCoordinates() as number[][][]);
              }
            }

            const multiPolygon = new MultiPolygon(coordinates);
            const multiPolygonFeature = new Feature(multiPolygon);

            const writer = new GeoJSON();

            const featuresGeoJson =
              writer.writeFeatureObject(multiPolygonFeature);

            const featuresGeoJsonStringified = JSON.stringify(
              featuresGeoJson.geometry,
            );
            setState("loading");
            _editLocationPolygon(id, featuresGeoJsonStringified)
              .then((response) => {
                if (response.statusCode === 201) {
                  setHelperCard({
                    show: true,
                    helperCardType: "CONFIRM",
                    content: <>Geometria atualizada!</>,
                  });
                  setState("success");
                } else if (response.statusCode === 401) {
                  setHelperCard({
                    show: true,
                    helperCardType: "ERROR",
                    content: <>Sem permissão para atualizar geometria!</>,
                  });
                  setState("error");
                } else if (response.statusCode === 500) {
                  setHelperCard({
                    show: true,
                    helperCardType: "ERROR",
                    content: <>Erro ao atualizar geometria!</>,
                  });
                  setState("error");
                }
              })
              .catch(() => {
                setHelperCard({
                  show: true,
                  helperCardType: "ERROR",
                  content: <>Erro ao atualizar geometria!</>,
                });
                setState("error");
              });
          }
        }}
        variant={state === "error" ? "destructive" : "admin"}
      >
        <span className="-mb-1 group-disabled:text-opacity-50">Atualizar</span>
      </Button>
    </div>
  );
};

export { EditPolygonSubmitButton };
