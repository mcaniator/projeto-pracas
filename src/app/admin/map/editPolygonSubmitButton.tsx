"use client";

import { Button } from "@/components/button";
import { editLocationPolygon } from "@/serverActions/manageLocations";
import Feature from "ol/Feature";
import GeoJSON from "ol/format/GeoJSON";
import { Geometry, MultiPolygon, SimpleGeometry } from "ol/geom";
import { Dispatch, SetStateAction, useEffect, useState } from "react";

const EditPolygonSubmitButton = ({
  id,
  features,
  isDisabled,
  setOriginalFeature,
  setCurrentId,
}: {
  id: number;
  features: Feature<Geometry>[];
  isDisabled: boolean;
  setOriginalFeature: Dispatch<SetStateAction<Feature<Geometry>[]>>;
  setCurrentId: Dispatch<SetStateAction<number>>;
}) => {
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
          const coordinates: number[][][][] = [];

          for (const feature of features) {
            const geometry = feature.getGeometry();

            if (geometry instanceof SimpleGeometry && Geometry !== undefined) {
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
            .then(() => setState("success"))
            .catch(() => setState("error"));
        }}
        isDisabled={isDisabled}
        variant={state === "error" ? "destructive" : "admin"}
      >
        <span className="-mb-1 text-white group-disabled:text-opacity-50">
          Enviar
        </span>
      </Button>
    </div>
  );
};

export { EditPolygonSubmitButton };
