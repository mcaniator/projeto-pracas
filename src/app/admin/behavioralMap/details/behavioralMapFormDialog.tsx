"use client";

import CDialog from "@/components/ui/dialog/cDialog";
import ResponseFormV2, {
  type ResponseFormGeometriesChange,
  type ResponseFormValuesChange,
} from "@/components/ui/responseForm/responseFormV2";
import type { GetFormSubmissionDataResult } from "@/lib/serverFunctions/queries/formSubmission";
import type {
  ResponseFormGeometry,
  SerializedFormValues,
} from "@/lib/types/formSubmission/responseFormTypes";
import { useCallback, useMemo, useRef } from "react";

const BehavioralMapFormDialog = ({
  open,
  formSubmission,
  locationPolygonGeoJson,
  serializedFormValues,
  geometries,
  onClose,
}: {
  open: boolean;
  formSubmission: GetFormSubmissionDataResult;
  locationPolygonGeoJson: string | null;
  serializedFormValues: SerializedFormValues;
  geometries: ResponseFormGeometry[];
  onClose: (
    serializedFormValues: SerializedFormValues,
    geometries: ResponseFormGeometry[],
  ) => void;
}) => {
  const serializedFormValuesRef = useRef(serializedFormValues);
  const geometriesRef = useRef(geometries);

  const formSubmissionData = useMemo(
    () => ({
      ...formSubmission,
      responsesFormValues: serializedFormValues,
      geometries,
    }),
    [formSubmission, serializedFormValues, geometries],
  );

  const handleValuesChange = useCallback(
    ({ serializedValues }: ResponseFormValuesChange) => {
      serializedFormValuesRef.current = serializedValues;
    },
    [],
  );
  const handleGeometriesChange = useCallback(
    ({ geometries: updatedGeometries }: ResponseFormGeometriesChange) => {
      geometriesRef.current = updatedGeometries;
    },
    [],
  );
  const handleClose = useCallback(() => {
    onClose(serializedFormValuesRef.current, geometriesRef.current);
  }, [onClose]);

  return (
    <CDialog
      open={open}
      fullScreen
      keepMounted
      title="Formulário"
      disableDialogActions
      onClose={handleClose}
    >
      <ResponseFormV2
        formSubmission={formSubmissionData}
        readOnly={false}
        locationPolygonGeoJson={locationPolygonGeoJson}
        onValuesChange={handleValuesChange}
        onGeometriesChange={handleGeometriesChange}
      />
    </CDialog>
  );
};

export default BehavioralMapFormDialog;
