"use client";

import CDialog from "@/components/ui/dialog/cDialog";
import { downloadBlob } from "@/lib/downloadFile";
import { useFetchAssessmentsExport } from "@/lib/serverFunctions/apiCalls/assessmentExport";
import type { FetchAssessmentUsersResponse } from "@/lib/serverFunctions/queries/assessment";
import type { FetchFormsResponse } from "@/lib/serverFunctions/queries/form";
import { getStoredLocationSelection } from "@/lib/utils/localStorage";
import { BrazilianStates } from "@prisma/client";
import { useEffect, useMemo, useState } from "react";

import type { AssessmentsFilterType } from "./assessmentsClient";
import AssessmentsFilter from "./assessmentsFilter";

export type AssessmentsExportFilters = {
  locationId?: number;
  formId?: number;
  startDate?: Date;
  endDate?: Date;
  userId?: string;
  cityId?: number;
  broadUnitId?: number;
  intermediateUnitId?: number;
  narrowUnitId?: number;
  finalizationStatus?: number;
  state: BrazilianStates | null;
};

const AssessmentsExportDialog = ({
  open,
  onClose,
  forms,
  users,
  isLoading,
  onFiltersChange,
}: {
  open: boolean;
  onClose: () => void;
  forms: FetchFormsResponse["forms"];
  users: FetchAssessmentUsersResponse["users"];
  isLoading?: boolean;
  onFiltersChange?: (filters: AssessmentsExportFilters) => void;
}) => {
  const [locationId, setLocationId] = useState<number>();
  const [formId, setFormId] = useState<number>();
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [userId, setUserId] = useState<string>();
  const [cityId, setCityId] = useState<number>();
  const [broadUnitId, setBroadUnitId] = useState<number>();
  const [intermediateUnitId, setIntermediateUnitId] = useState<number>();
  const [narrowUnitId, setNarrowUnitId] = useState<number>();
  const [finalizationStatus, setFinalizationStatus] = useState<number>();
  const [state, setState] = useState<BrazilianStates | null>(
    () => getStoredLocationSelection()?.state ?? "MG",
  );
  const [fetchAssessmentsExport, isExporting] = useFetchAssessmentsExport({
    callbacks: {
      onSuccess: ({ data, filename, mimeType }) => {
        if (!data || !filename || !mimeType) return;

        void downloadBlob({
          filename: filename,
          mimeType: mimeType,
          blob: data,
        });
      },
    },
  });

  const filters = useMemo<AssessmentsExportFilters>(
    () => ({
      locationId,
      formId,
      startDate,
      endDate,
      userId,
      cityId,
      broadUnitId,
      intermediateUnitId,
      narrowUnitId,
      finalizationStatus,
      state,
    }),
    [
      locationId,
      formId,
      startDate,
      endDate,
      userId,
      cityId,
      broadUnitId,
      intermediateUnitId,
      narrowUnitId,
      finalizationStatus,
      state,
    ],
  );

  useEffect(() => {
    onFiltersChange?.(filters);
  }, [filters, onFiltersChange]);

  const handleFilterChange = ({
    type,
    newValue,
  }: {
    type: AssessmentsFilterType;
    newValue: string | number | Date | null;
  }) => {
    if (newValue === null) {
      switch (type) {
        case "LOCATION_ID":
          setLocationId(undefined);
          break;
        case "FORM_ID":
          setFormId(undefined);
          break;
        case "USER_ID":
          setUserId(undefined);
          break;
        case "START_DATE":
          setStartDate(undefined);
          break;
        case "END_DATE":
          setEndDate(undefined);
          break;
        case "CITY_ID":
          setCityId(undefined);
          break;
        case "BROAD_UNIT_ID":
          setBroadUnitId(undefined);
          break;
        case "INTERMEDIATE_UNIT_ID":
          setIntermediateUnitId(undefined);
          break;
        case "NARROW_UNIT_ID":
          setNarrowUnitId(undefined);
          break;
        case "FINALIZATION_STATUS":
          setFinalizationStatus(undefined);
          break;
      }
    } else if (typeof newValue === "string") {
      if (type === "USER_ID") setUserId(newValue);
    } else if (typeof newValue === "number") {
      switch (type) {
        case "LOCATION_ID":
          setLocationId(newValue);
          break;
        case "FORM_ID":
          setFormId(newValue);
          break;
        case "CITY_ID":
          setCityId(newValue);
          break;
        case "BROAD_UNIT_ID":
          setBroadUnitId(newValue);
          break;
        case "INTERMEDIATE_UNIT_ID":
          setIntermediateUnitId(newValue);
          break;
        case "NARROW_UNIT_ID":
          setNarrowUnitId(newValue);
          break;
        case "FINALIZATION_STATUS":
          setFinalizationStatus(newValue);
          break;
      }
    } else if (newValue instanceof Date) {
      if (type === "START_DATE") setStartDate(newValue);
      if (type === "END_DATE") setEndDate(newValue);
    }
  };

  const handleExport = async () => {
    await fetchAssessmentsExport({ params: filters });
  };

  return (
    <CDialog
      title="Exportar avaliações"
      open={open}
      onClose={onClose}
      fullScreen
      keepMounted
      confirmChildren="Exportar"
      confirmLoading={isExporting}
      disableConfirmButton={isLoading}
      onConfirm={() => void handleExport()}
    >
      <AssessmentsFilter
        forms={forms}
        users={users}
        isLoading={isLoading}
        selectedLocationId={locationId}
        defaultLocationId={undefined}
        clearableStateAndCitySelection
        onSelectedStateChange={setState}
        handleFilterChange={handleFilterChange}
      />
    </CDialog>
  );
};

export default AssessmentsExportDialog;
