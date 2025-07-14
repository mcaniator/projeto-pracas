"use client";

import { Button } from "@/components/button";
import LocationRegisterForm from "@components/locationForm/locationRegisterForm";
import { FetchCitiesType } from "@queries/city";
import { IconX } from "@tabler/icons-react";
import Feature from "ol/Feature";
import GeoJSON from "ol/format/GeoJSON";
import { Geometry, MultiPolygon, SimpleGeometry } from "ol/geom";
import { Dispatch, SetStateAction, useState } from "react";
import {
  Dialog,
  DialogTrigger,
  Modal,
  ModalOverlay,
} from "react-aria-components";

const CreationDrawingModal = ({
  features,
  setCurrentId,
  drawingWindowVisible,
  setDrawingWindowVisible,
  cities,
  locationCategories,
  locationTypes,
}: {
  features: Feature<Geometry>[];
  setCurrentId: Dispatch<SetStateAction<number>>;
  drawingWindowVisible: boolean;
  setDrawingWindowVisible: Dispatch<SetStateAction<boolean>>;
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
  const [open, setOpen] = useState(false);
  const [featuresGeoJson, setFeaturesGeoJson] = useState("");

  return (
    <DialogTrigger
      isOpen={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen);

        if (isOpen) {
          const coordinates: number[][][][] = [];

          for (const feature of features) {
            const geometry = feature.getGeometry();

            if (geometry instanceof SimpleGeometry) {
              coordinates.push(geometry.getCoordinates() as number[][][]);
            }
          }

          const multiPolygon = new MultiPolygon(coordinates);
          const multiPolygonFeature = new Feature(multiPolygon);

          const writer = new GeoJSON();
          const featuresGeoJsonObject =
            writer.writeFeatureObject(multiPolygonFeature);
          setFeaturesGeoJson(JSON.stringify(featuresGeoJsonObject.geometry));
        }
      }}
    >
      <Button
        type="button"
        isDisabled={features.length < 1}
        variant={"admin"}
        onPress={() => setDrawingWindowVisible(!drawingWindowVisible)}
      >
        <span className="-mb-1 transition-all group-data-[disabled]:text-opacity-50">
          Confirmar e criar
        </span>
      </Button>
      <ModalOverlay
        className={({ isEntering, isExiting }) =>
          `fixed inset-0 z-50 flex min-h-full items-center justify-center overflow-y-auto bg-black/25 p-4 text-center backdrop-blur ${
            isEntering ? "duration-300 ease-out animate-in fade-in" : ""
          } ${isExiting ? "duration-200 ease-in animate-out fade-out" : ""} `
        }
        isDismissable
      >
        <Modal
          className={({ isEntering, isExiting }) =>
            `max-h-full w-full max-w-lg overflow-scroll rounded-2xl bg-off-white p-6 text-left align-middle shadow-xl ${
              isEntering ? "duration-300 ease-out animate-in zoom-in-95" : ""
            } ${isExiting ? "duration-200 ease-in animate-out zoom-out-95" : ""} `
          }
        >
          <Dialog className="outline-none data-[focus-visible]:outline data-[focus-visible]:ring-1 data-[focus-visible]:ring-ring">
            {({ close }) => (
              <div className="flex flex-col gap-2">
                <div className="flex justify-between">
                  <h2 className="text-4xl font-semibold">Cadastrar Praça</h2>
                  <Button
                    className="text-black"
                    variant={"ghost"}
                    size={"icon"}
                    onPress={close}
                  >
                    <IconX />
                  </Button>
                </div>
                <LocationRegisterForm
                  hasDrawing={true}
                  cities={cities}
                  formType="CREATE"
                  featuresGeoJson={featuresGeoJson}
                  locationCategories={locationCategories}
                  locationTypes={locationTypes}
                  onSuccess={() => {
                    close();
                    setTimeout(() => {
                      setCurrentId(-2);
                      setDrawingWindowVisible(true);
                    }, 200);
                  }}
                />
              </div>
            )}
          </Dialog>
        </Modal>
      </ModalOverlay>
    </DialogTrigger>
  );
};

export { CreationDrawingModal };
