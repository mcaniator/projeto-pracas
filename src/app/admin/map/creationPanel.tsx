"use client";

import { Button } from "@/components/button";
import { IconCancel, IconTrashX } from "@tabler/icons-react";
import Feature from "ol/Feature";
import { Geometry, MultiPolygon, Polygon } from "ol/geom";
import { VectorSourceEvent } from "ol/source/Vector";
import {
  Dispatch,
  SetStateAction,
  useContext,
  useEffect,
  useState,
} from "react";

import { CreationDrawingModal } from "./creationDrawingModal";
import { CreationSelecion } from "./creationSelection";
import { DrawingProviderVectorSourceContext } from "./drawingProvider";
import { EditPolygonSubmitButton } from "./editPolygonSubmitButton";
import { PolygonProviderVectorSourceContext } from "./polygonProvider";

const CreationPanel = ({
  originalFeatures,
  setOriginalFeatures,
  currentId,
  setCurrentId,
  setDrawingWindowVisible,
}: {
  originalFeatures: Feature<Geometry>[];
  setOriginalFeatures: Dispatch<SetStateAction<Feature<Geometry>[]>>;
  currentId: number;
  setCurrentId: Dispatch<SetStateAction<number>>;
  setDrawingWindowVisible: Dispatch<SetStateAction<boolean>>;
}) => {
  const drawingProviderContext = useContext(DrawingProviderVectorSourceContext);
  const [features, setFeatures] = useState<Feature<Geometry>[]>([]);

  const polygonProviderContext = useContext(PolygonProviderVectorSourceContext);

  useEffect(() => {
    setFeatures([]);

    for (const feature of originalFeatures) {
      setFeatures((features) => {
        const clonedFeature = feature.clone();
        clonedFeature.setId(features.length);

        return [...features, clonedFeature];
      });
    }
  }, [originalFeatures]);

  useEffect(() => {
    drawingProviderContext.addFeatures(features);

    const addFeature = (event: VectorSourceEvent<Feature<Geometry>>) => {
      const feature = event.feature;

      if (feature !== undefined) {
        drawingProviderContext.removeFeature(feature);

        feature.setId(features.length);
        setFeatures([...features, feature]);
      }
    };
    drawingProviderContext.on("addfeature", addFeature);

    const changeFeature = (event: VectorSourceEvent<Feature<Geometry>>) => {
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
    };
    drawingProviderContext.on("changefeature", changeFeature);

    const removeFeature = (event: VectorSourceEvent<Feature<Geometry>>) => {
      const feature = event.feature;
      const featureId = feature?.getId();

      if (typeof featureId === "number" && feature !== undefined) {
        const featureIndex = features.findIndex(
          (feature) => feature.getId() === featureId,
        );

        if (featureIndex >= 0 && featureIndex < features.length) {
          const helperFeatures = features.toSpliced(featureIndex, 1);
          setFeatures(helperFeatures);
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
    for (let i = 0; i < features.length; i++) {
      features[i]?.set("description", i + 1 + "");
    }
  }, [features]);
  return (
    <div className="flex h-full flex-col gap-2">
      <div className="flex flex-wrap gap-2">
        {/*currentId === -3 ?
          <CreationModal features={features} setCurrentId={setCurrentId} />
        : <EditPolygonSubmitButton
            id={currentId}
            features={features}
            isDisabled={features.length === 0} // TODO: try to find a way to efficiently compare current features with the original ones
            setOriginalFeature={setOriginalFeatures}
            setCurrentId={setCurrentId}
          />*/}

        {currentId === -1 && (
          <CreationSelecion
            setCurrentId={setCurrentId}
            setDrawingWindowVisible={setDrawingWindowVisible}
          />
        )}
        {currentId === -3 && (
          <CreationDrawingModal
            features={features}
            setCurrentId={setCurrentId}
            setDrawingWindowVisible={setDrawingWindowVisible}
          />
        )}
        {currentId >= 0 && (
          <EditPolygonSubmitButton
            id={currentId}
            features={features}
            setOriginalFeature={setOriginalFeatures}
            setCurrentId={setCurrentId}
          />
        )}

        <Button
          onPress={() => {
            const polygons = originalFeatures.map((feature) => {
              const geometry = feature.getGeometry();

              if (!(geometry instanceof Polygon)) {
                throw new Error("Geometry isn't of Polygon type");
              }

              return geometry.clone();
            });

            const originalMultiPolygon = new MultiPolygon(polygons);
            originalMultiPolygon.set(
              "name",
              originalFeatures[0]?.get("name") ?? "",
            );
            const originalFeature = new Feature(originalMultiPolygon);
            originalFeature.setId(currentId);

            polygonProviderContext.addFeature(originalFeature);

            setCurrentId(-2);
            setOriginalFeatures([]);
          }}
          variant={"destructive"}
        >
          <span className="text-white">
            <IconCancel />
          </span>
        </Button>
      </div>
      <hr className="rounded-full border-2 border-off-white" />
      <FeatureList features={features} />
    </div>
  );
};

const FeatureList = ({ features }: { features: Feature<Geometry>[] }) => {
  const source = useContext(DrawingProviderVectorSourceContext);

  return (
    <div className="flex h-full flex-col gap-2 overflow-scroll">
      {features.length === 0 && (
        <div className="flex w-full items-center justify-center text-2xl text-white">
          Selecione o perímetro
        </div>
      )}
      {features.map((feature, index) => {
        return (
          <div key={index} className="flex w-full items-center">
            <p className="-mb-1 text-xl text-white">Polígono {index + 1}</p>
            <Button
              type="button"
              className="ml-auto"
              size={"icon"}
              variant={"destructive"}
              onPress={() => {
                source.removeFeature(feature);
              }}
            >
              <IconTrashX className="text-white" />
            </Button>
          </div>
        );
      })}
    </div>
  );
};

export { CreationPanel };
