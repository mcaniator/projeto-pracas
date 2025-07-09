"use client";

import { Button } from "@/components/button";
import { useHelperCard } from "@components/context/helperCardContext";
import { editLocationPolygon } from "@serverActions/manageLocations";
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
}: {
  id: number;
  features: Feature<Geometry>[];
  setOriginalFeature: Dispatch<SetStateAction<Feature<Geometry>[]>>;
  setCurrentId: Dispatch<SetStateAction<number>>;
}) => {
  const { setHelperCard } = useHelperCard();
  const [state, setState] = useState<
    "normal" | "loading" | "success" | "error"
  >("normal");

  useEffect(() => {
    switch (state) {
      case "success":
        setOriginalFeature([]);

        // timeout needed because otherwise it goes back to the park list without having gotten the new park data from the server
        setTimeout(() => {
          setCurrentId(-2);
        }, 200);

        break;
      case "error":
        setTimeout(() => {
          setState("normal");
        }, 2000);

        break;
    }
  }, [state, setOriginalFeature, setCurrentId]);

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
            editLocationPolygon(id, featuresGeoJsonStringified)
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
        <span className="-mb-1 group-disabled:text-opacity-50">Enviar</span>
      </Button>
    </div>
  );
};

export { EditPolygonSubmitButton };
