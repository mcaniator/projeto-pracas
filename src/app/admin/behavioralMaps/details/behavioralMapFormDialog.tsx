"use client";

import CDialog from "@/components/ui/dialog/cDialog";
import ResponseFormV2, {
  type ResponseFormGeometriesChange,
  type ResponseFormV2Handle,
  type ResponseFormValuesChange,
} from "@/components/ui/responseForm/responseFormV2";
import type { GetFormSubmissionDataResult } from "@/lib/serverFunctions/queries/formSubmission";
import type {
  ResponseFormGeometry,
  SerializedFormValues,
} from "@/lib/types/formSubmission/responseFormTypes";
import { type Ref, useCallback, useEffect, useMemo, useRef } from "react";

const BehavioralMapFormDialog = ({
  open,
  responseFormRef,
  formSubmission,
  locationPolygonGeoJson,
  serializedFormValues,
  geometries,
  onDraftChange,
  onClose,
}: {
  open: boolean;
  responseFormRef: Ref<ResponseFormV2Handle>;
  formSubmission: GetFormSubmissionDataResult;
  locationPolygonGeoJson: string | null;
  serializedFormValues: SerializedFormValues;
  geometries: ResponseFormGeometry[];
  onDraftChange: (
    serializedFormValues: SerializedFormValues,
    geometries: ResponseFormGeometry[],
  ) => void;
  onClose: (
    serializedFormValues: SerializedFormValues,
    geometries: ResponseFormGeometry[],
  ) => void;
}) => {
  const serializedFormValuesRef = useRef(serializedFormValues);
  const geometriesRef = useRef(geometries);
  const hasChangesRef = useRef(false);
  const onDraftChangeRef = useRef(onDraftChange);
  useEffect(() => {
    onDraftChangeRef.current = onDraftChange;
  }, [onDraftChange]);

  const scheduleFormDraftSave = useCallback(() => {
    hasChangesRef.current = true;
    onDraftChangeRef.current(
      { ...serializedFormValuesRef.current },
      geometriesRef.current,
    );
  }, []);

  const formSubmissionData = useMemo(
    () => ({
      ...formSubmission,
      responsesFormValues: serializedFormValues,
      geometries,
    }),
    [formSubmission, serializedFormValues, geometries],
  );

  const handleValuesChange = useCallback(
    ({ serializedValues, source }: ResponseFormValuesChange) => {
      serializedFormValuesRef.current = serializedValues;
      if (source === "user") scheduleFormDraftSave();
    },
    [scheduleFormDraftSave],
  );
  const handleGeometriesChange = useCallback(
    ({ geometries: updatedGeometries, source }: ResponseFormGeometriesChange) => {
      geometriesRef.current = updatedGeometries;
      if (source === "user") scheduleFormDraftSave();
    },
    [scheduleFormDraftSave],
  );
  const handleClose = useCallback(() => {
    if (hasChangesRef.current) {
      onClose({ ...serializedFormValuesRef.current }, geometriesRef.current);
      hasChangesRef.current = false;
    } else {
      onClose(serializedFormValues, geometries);
    }
  }, [geometries, onClose, serializedFormValues]);

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
        ref={responseFormRef}
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
