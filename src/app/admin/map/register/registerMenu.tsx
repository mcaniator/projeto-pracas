"use client";

import LocationRegisterDialog from "@/app/admin/map/register/locationRegisterDialog";
import { Divider } from "@mui/material";
import { IconMapOff, IconPencil, IconX } from "@tabler/icons-react";
import Feature from "ol/Feature";
import { Geometry } from "ol/geom";
import { useState } from "react";

import CButton from "../../../../components/ui/cButton";
import { DrawingProvider } from "../drawingProvider";
import FeatureList from "./featureList";

const RegisterMenu = ({
  close,
  reloadLocations,
  reloadLocationCategories,
  reloadLocationTypes,
  reloadCities,
}: {
  close: () => void;
  reloadLocations: () => void;
  reloadLocationCategories: () => void;
  reloadLocationTypes: () => void;
  reloadCities: () => void;
}) => {
  const [isDrawingCreation, setIsDrawingCreation] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [features, setFeatures] = useState<Feature<Geometry>[]>([]);
  const [openLocationRegisterFormDialog, setOpenLocationRegisterFormDialog] =
    useState(false);
  const handleClose = () => {
    setIsDrawingCreation(false);
    setIsCreating(false);
    close();
  };
  const resetData = () => {
    setIsDrawingCreation(false);
    setIsCreating(false);
    setFeatures([]);
    setOpenLocationRegisterFormDialog(false);
  };
  return (
    <div
      className="flex max-h-full w-64 flex-col gap-1 overflow-auto rounded-xl bg-white p-1 text-black"
      style={{ boxShadow: "0px 0px 10px 5px rgba(0, 0, 0, 0.1)" }}
    >
      <div className="flex h-full flex-col gap-1 overflow-auto">
        <div className="flex items-center justify-between">
          <div className="text-xl">Cadastrar praça</div>
          <CButton variant="text" onClick={handleClose}>
            <IconX />
          </CButton>
        </div>
        <Divider />
        {!isCreating && (
          <>
            <CButton
              onClick={() => {
                setIsDrawingCreation(true);
                setIsCreating(true);
              }}
            >
              <IconPencil />
              com desenho
            </CButton>
            <CButton
              onClick={() => {
                setIsCreating(true);
                setIsDrawingCreation(false);
                setFeatures([]);
                setOpenLocationRegisterFormDialog(true);
              }}
            >
              <IconMapOff />
              sem desenho
            </CButton>
          </>
        )}
        {isCreating && isDrawingCreation && (
          <DrawingProvider>
            <FeatureList
              features={features}
              setFeatures={setFeatures}
              setOpenLocationRegisterFormDialog={
                setOpenLocationRegisterFormDialog
              }
            />
          </DrawingProvider>
        )}
        {isCreating && (
          <LocationRegisterDialog
            features={features}
            open={openLocationRegisterFormDialog}
            onClose={() => {
              resetData();
            }}
            reloadLocations={reloadLocations}
            reloadLocationCategories={reloadLocationCategories}
            reloadLocationTypes={reloadLocationTypes}
            reloadCities={reloadCities}
          />
        )}
      </div>
    </div>
  );
};

export default RegisterMenu;
