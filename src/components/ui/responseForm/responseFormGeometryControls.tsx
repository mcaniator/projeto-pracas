"use client";

import CButton from "@/components/ui/cButton";
import type { FormSubmissionQuestionItem } from "@/lib/serverFunctions/queries/formSubmission";
import type { ResponseFormGeometry } from "@/lib/types/formSubmission/responseFormTypes";
import { IconMap } from "@tabler/icons-react";
import { useState } from "react";

import ResponseFormMapDialog from "./responseFormMapDialog";

const ResponseFormGeometryControls = ({
  question,
  geometries,
  locationPolygonGeoJson,
  finalized,
  handleResponseGeometryChange,
}: {
  question: FormSubmissionQuestionItem;
  geometries: ResponseFormGeometry[];
  locationPolygonGeoJson: string | null;
  finalized: boolean;
  handleResponseGeometryChange: (params: ResponseFormGeometry) => void;
}) => {
  const [openMapDialog, setOpenMapDialog] = useState(false);
  const currentGeometriesCount =
    geometries.find((geometry) => geometry.questionId === question.questionId)
      ?.geometries.length ?? 0;

  if (question.geometryTypes.length === 0) {
    return null;
  }

  return (
    <>
      <CButton
        square
        tooltip="Geometrias da resposta"
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
        questionId={question.questionId}
        questionName={question.name}
        locationPolygonGeoJson={locationPolygonGeoJson}
        initialGeometries={
          geometries.find((g) => g.questionId === question.questionId)
            ?.geometries
        }
        geometryType={question.geometryTypes}
        finalized={finalized}
        handleResponseGeometryChange={(questionId, nextGeometries) => {
          handleResponseGeometryChange({
            questionId,
            geometries: nextGeometries,
          });
        }}
      />
    </>
  );
};

export default ResponseFormGeometryControls;
