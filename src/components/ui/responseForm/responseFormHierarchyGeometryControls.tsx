"use client";

import CButton from "@/components/ui/cButton";
import type {
  HierarchyFormGeometry,
  ResponseGeometry,
} from "@/lib/types/formSubmission/responseFormTypes";
import type { QuestionGeometryTypes } from "@prisma/client";
import { IconMap } from "@tabler/icons-react";
import { useState } from "react";

import ResponseFormMapDialog from "./responseFormMapDialog";

const ResponseFormHierarchyGeometryControls = ({
  targetKey,
  targetName,
  geometries,
  locationPolygonGeoJson,
  finalized,
  geometryTypes = ["POINT", "POLYGON"],
  onGeometriesChange,
}: {
  targetKey: string;
  targetName: string;
  geometries: HierarchyFormGeometry[];
  locationPolygonGeoJson: string | null;
  finalized: boolean;
  geometryTypes?: QuestionGeometryTypes[];
  onGeometriesChange: (
    targetKey: string,
    geometries: ResponseGeometry[],
  ) => void;
}) => {
  const [openMapDialog, setOpenMapDialog] = useState(false);
  const currentGeometriesCount =
    geometries.find((geometry) => geometry.key === targetKey)?.geometries
      .length ?? 0;

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
          geometries.find((geometry) => geometry.key === targetKey)?.geometries
        }
        geometryType={geometryTypes}
        finalized={finalized}
        handleResponseGeometryChange={(_, nextGeometries) => {
          onGeometriesChange(targetKey, nextGeometries);
        }}
      />
    </>
  );
};

export default ResponseFormHierarchyGeometryControls;
