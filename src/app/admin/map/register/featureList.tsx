"use client";

import { IconCheck, IconTrashX, IconUpload } from "@tabler/icons-react";
import Feature from "ol/Feature";
import { Geometry } from "ol/geom";
import { VectorSourceEvent } from "ol/source/Vector";
import { useContext, useEffect, useState } from "react";

import CButton from "../../../../components/ui/cButton";
import { DrawingProviderVectorSourceContext } from "../drawingProvider";
import LocationRegisterDialog from "./locationRegisterDialog";

const FeatureList = () => {
  const [features, setFeatures] = useState<Feature<Geometry>[]>([]);
  const drawingProviderContext = useContext(DrawingProviderVectorSourceContext);
  const [openLocationRegisterFormDialog, setOpenLocationRegisterFormDialog] =
    useState(false);

  useEffect(() => {
    drawingProviderContext.addFeatures(features);

    const addFeature = (event: VectorSourceEvent<Feature<Geometry>>) => {
      const feature = event.feature;

      if (feature !== undefined) {
        drawingProviderContext.removeFeature(feature);
        const lastFeature = features[features.length - 1];
        const id =
          lastFeature != undefined ? Number(lastFeature.getId()) + 1 : 0;
        feature.setId(id);
        feature.set("description", String(id + 1));
        setFeatures([...features, feature]);
      }
    };
    drawingProviderContext.on("addfeature", addFeature);

    const changeFeature = (event: VectorSourceEvent<Feature<Geometry>>) => {
      drawingProviderContext.un("changefeature", changeFeature);
      const feature = event.feature;
      const featureId = feature?.getId();

      if (typeof featureId === "number" && feature !== undefined) {
        const featureIndex = features.findIndex(
          (feature) => feature.getId() === featureId,
        );

        if (featureIndex >= 0 && featureIndex <= features.length) {
          setFeatures((features) => {
            const helperFeatures = features;
            helperFeatures[featureIndex] = feature;
            return helperFeatures;
          });
        }
      }
      drawingProviderContext.on("changefeature", changeFeature);
    };
    drawingProviderContext.on("changefeature", changeFeature);

    const removeFeature = (event: VectorSourceEvent<Feature<Geometry>>) => {
      const feature = event.feature;
      const featureId = feature?.getId();

      if (typeof featureId === "number" && feature !== undefined) {
        const featureIndex = features.findIndex(
          (feature) => feature.getId() === featureId,
        );

        const newFeaturesArr: Feature<Geometry>[] = [];
        for (let i = 0; i < features.length; i++) {
          if (i === featureIndex) {
            continue;
          }
          const f = features[i];
          if (!f) {
            throw new Error("Tried to manipulated non existent feature");
          }
          if (i > featureIndex) {
            f?.set("description", String(i));
          }
          newFeaturesArr.push(f);
        }
        setFeatures(newFeaturesArr);
      }
    };
    drawingProviderContext.on("removefeature", removeFeature);

    return () => {
      drawingProviderContext.un("addfeature", addFeature);
      drawingProviderContext.un("changefeature", changeFeature);
      drawingProviderContext.un("removefeature", removeFeature);

      drawingProviderContext.removeFeatures(features);
    };
  }, [drawingProviderContext, features]);
  console.log(features);
  return (
    <div className="flex h-full flex-col gap-2 overflow-auto">
      {features.length === 0 && (
        <div className="text-md flex w-full items-center justify-center">
          Selecione o perímetro da praça clicando no mapa, ou importe um arquivo
          shapefile.
        </div>
      )}
      {features.length === 0 && (
        <CButton toDo>
          <IconUpload />
          Importar shapefile
        </CButton>
      )}

      {features.map((feature, index) => {
        return (
          <div key={index} className="flex w-full items-center">
            <p className="-mb-1 text-xl">Polígono {index + 1}</p>
            <CButton
              type="button"
              className="ml-auto"
              variant="text"
              color="error"
              onClick={() => {
                drawingProviderContext.removeFeature(feature);
              }}
            >
              <IconTrashX />
            </CButton>
          </div>
        );
      })}
      {features.length > 0 && (
        <CButton
          onClick={() => {
            setOpenLocationRegisterFormDialog(true);
          }}
        >
          <IconCheck />
          Confirmar
        </CButton>
      )}
      <LocationRegisterDialog
        features={features}
        open={openLocationRegisterFormDialog}
        onClose={() => {
          setOpenLocationRegisterFormDialog(false);
        }}
      />
    </div>
  );
};

export default FeatureList;
