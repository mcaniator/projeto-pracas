"use client";

import CButton from "@/components/ui/cButton";
import type {
  FormItemGeometry,
  ResponseGeometry,
} from "@/lib/types/formSubmission/responseFormTypes";
import type { QuestionGeometryTypes } from "@prisma/client";
import { IconMap } from "@tabler/icons-react";
import { useState } from "react";

import ResponseFormMapDialog from "./responseFormMapDialog";

const ResponseFormFormItemGeometryControls = ({
  formItemId,
  itemType,
  targetName,
  geometries,
  locationPolygonGeoJson,
  finalized,
  geometryTypes = ["POINT", "POLYGON"],
  onGeometriesChange,
}: {
  formItemId: number;
  itemType: "CATEGORY" | "SUBCATEGORY";
  targetName: string;
  geometries: FormItemGeometry[];
  locationPolygonGeoJson: string | null;
  finalized: boolean;
  geometryTypes?: QuestionGeometryTypes[];
  onGeometriesChange: (
    formItemId: number,
    itemType: "CATEGORY" | "SUBCATEGORY",
    geometries: ResponseGeometry[],
  ) => void;
}) => {
  const [openMapDialog, setOpenMapDialog] = useState(false);
  const currentGeometriesCount =
    geometries.find((geometry) => geometry.formItemId === formItemId)
      ?.geometries.length ?? 0;

  return (
    <>
      <CButton
        square
        tooltip={`Associar geometria a ${targetName}`}
        enableTopLeftChip={currentGeometriesCount > 0}
        topLeftChipLabel={currentGeometriesCount}
        onClick={() => {
          setOpenMapDialog(true);
        }}
      >
        <IconMap />
      </CButton>
      <ResponseFormMapDialog
        openMapDialog={openMapDialog}
        onClose={() => {
          setOpenMapDialog(false);
        }}
        questionId={0}
        questionName={targetName}
        locationPolygonGeoJson={locationPolygonGeoJson}
        initialGeometries={
          geometries.find((geometry) => geometry.formItemId === formItemId)
            ?.geometries
        }
        geometryType={geometryTypes}
        finalized={finalized}
        handleResponseGeometryChange={(_, nextGeometries) => {
          onGeometriesChange(formItemId, itemType, nextGeometries);
        }}
      />
    </>
  );
};

export default ResponseFormFormItemGeometryControls;
