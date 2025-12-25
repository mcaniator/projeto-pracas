"use client";

import { MapContext } from "@/app/admin/map/mapProvider";
import { PolygonProviderContext } from "@/app/admin/map/polygonProvider";
import { useHelperCard } from "@/components/context/helperCardContext";
import CButtonFilePicker from "@/components/ui/cButtonFilePicker";
import { sleep } from "@/lib/utils/sleep";
import { LinearProgress } from "@mui/material";
import { IconCheck, IconTrashX, IconUpload } from "@tabler/icons-react";
import Feature from "ol/Feature";
import { createEmpty, extend } from "ol/extent";
import GeoJSON from "ol/format/GeoJSON";
import { Geometry } from "ol/geom";
import { VectorSourceEvent } from "ol/source/Vector";
import { useContext, useEffect, useState } from "react";
import shp from "shpjs";

import CButton from "../../../../components/ui/cButton";
import { DrawingProviderVectorSourceContext } from "../drawingProvider";
import LocationRegisterDialog from "./locationRegisterDialog";

const FeatureList = ({ reloadLocations }: { reloadLocations: () => void }) => {
  const { setHelperCard } = useHelperCard();
  const [features, setFeatures] = useState<Feature<Geometry>[]>([]);
  const drawingProviderContext = useContext(DrawingProviderVectorSourceContext);
  const map = useContext(MapContext);
  const view = map?.getView();
  const polygonProvider = useContext(PolygonProviderContext);
  const [openLocationRegisterFormDialog, setOpenLocationRegisterFormDialog] =
    useState(false);
  const [uploadedShapeFile, setUploadedShapeFile] = useState(false);
  const [importingShapeFile, setImportingShapeFile] = useState(false);

  const handleShapefileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setImportingShapeFile(true);
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const arrayBuffer = await file.arrayBuffer();

      const geojson = await shp(arrayBuffer);

      const geojsonFormat = new GeoJSON();

      const importedFeatures = geojsonFormat.readFeatures(geojson);

      for (const feature of importedFeatures) {
        drawingProviderContext.addFeature(feature);
        await sleep(500); //This is needed because inserting features too fast causes then to be considered a single feature
      }
      if (importedFeatures.length > 0) {
        if (view) {
          const extent = createEmpty();

          importedFeatures.forEach((feature) => {
            const geometry = feature.getGeometry();
            if (geometry) {
              extend(extent, geometry.getExtent());
            }
          });

          view.fit(extent, {
            padding: [50, 50, 50, 50],
            duration: 500,
            maxZoom: 18,
          });
        }
      } else {
        setHelperCard({
          show: true,
          helperCardType: "ERROR",
          content: <>Shapefile vazio!</>,
        });
      }

      setUploadedShapeFile(true);
    } catch (error) {
      setHelperCard({
        show: true,
        helperCardType: "ERROR",
        content: <>Erro ao importar shapefile!</>,
      });
    } finally {
      setImportingShapeFile(false);
    }
  };

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
        if (newFeaturesArr.length === 0) {
          setUploadedShapeFile(false);
        }
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

  useEffect(() => {
    polygonProvider?.setVisible(false);

    return () => {
      polygonProvider?.setVisible(true);
    };
  }, [polygonProvider]);
  return (
    <div className="flex h-full flex-col gap-2 overflow-auto">
      {features.length === 0 && (
        <div className="text-md flex w-full items-center justify-center">
          Selecione o perímetro da praça clicando no mapa, ou importe um
          shapefile em formato .zip.
        </div>
      )}
      {features.length === 0 && (
        <CButtonFilePicker
          onFileInput={(e) => {
            void handleShapefileUpload(e);
          }}
        >
          <IconUpload />
          Importar shapefile
        </CButtonFilePicker>
      )}
      {importingShapeFile && (
        <div className="flex w-full flex-col justify-center text-lg">
          <LinearProgress />
          Importando...
        </div>
      )}
      {features.length > 0 && uploadedShapeFile && (
        <div className="text-md flex w-full items-center justify-center">
          Shapefile importado com sucesso! Edite ou adicione mais polígonos.
        </div>
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
        reloadLocations={reloadLocations}
      />
    </div>
  );
};

export default FeatureList;
