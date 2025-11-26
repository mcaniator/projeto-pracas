"use client";

import { Divider } from "@mui/material";
import { IconMapOff, IconPencil, IconUpload, IconX } from "@tabler/icons-react";
import { useState } from "react";

import CButton from "../../../../components/ui/cButton";
import { FetchCitiesType } from "../../../../lib/serverFunctions/queries/city";
import { DrawingProvider } from "../drawingProvider";
import PolygonProvider from "../polygonProvider";
import FeatureList from "./featureList";

const RegisterMenu = ({
  citiesPromise,
  locationCategoriesPromise,
  locationTypesPromise,
  close,
}: {
  citiesPromise: Promise<FetchCitiesType>;
  locationCategoriesPromise: Promise<{
    statusCode: number;
    message: string;
    categories: { id: number; name: string }[];
  }>;
  locationTypesPromise: Promise<{
    statusCode: number;
    message: string;
    types: { id: number; name: string }[];
  }>;
  close: () => void;
}) => {
  const [isDrawingCreation, setIsDrawingCreation] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const handleClose = () => {
    setIsDrawingCreation(false);
    setIsCreating(false);
    close();
  };
  return (
    <div
      className="flex max-h-full w-96 flex-col gap-1 overflow-auto rounded-xl bg-white p-1 text-black"
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
              Cadastrar com desenho
            </CButton>
            <CButton>
              <IconMapOff />
              Cadastrar sem desenho
            </CButton>
          </>
        )}
        {isCreating && isDrawingCreation && (
          <DrawingProvider>
            <FeatureList />
          </DrawingProvider>
        )}
      </div>
    </div>
  );
};

export default RegisterMenu;
