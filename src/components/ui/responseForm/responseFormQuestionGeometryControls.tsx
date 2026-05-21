"use client";

import CButton from "@/components/ui/cButton";
import type { AssessmentQuestionItem } from "@/lib/serverFunctions/queries/assessment";
import { IconMap } from "@tabler/icons-react";
import { useState } from "react";
import ResponseFormMapDialog from "./responseFormMapDialog";
import type { ResponseFormGeometry } from "./responseFormTypes";

const ResponseFormQuestionGeometryControls = ({
  question,
  geometries,
  locationPolygonGeoJson,
  finalized,
  handleQuestionGeometryChange,
}: {
  question: AssessmentQuestionItem;
  geometries: ResponseFormGeometry[];
  locationPolygonGeoJson: string | null;
  finalized: boolean;
  handleQuestionGeometryChange: (params: ResponseFormGeometry) => void;
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
        handleQuestionGeometryChange={(questionId, nextGeometries) => {
          handleQuestionGeometryChange({
            questionId,
            geometries: nextGeometries,
          });
        }}
      />
    </>
  );
};

export default ResponseFormQuestionGeometryControls;
