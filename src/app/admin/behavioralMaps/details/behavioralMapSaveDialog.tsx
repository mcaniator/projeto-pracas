"use client";

import { useLoadingOverlay } from "@/components/context/loadingContext";
import { useNetwork } from "@/components/context/networkContext";
import CDateTimePicker from "@/components/ui/cDateTimePicker";
import CSwitch from "@/components/ui/cSwtich";
import CDialog from "@/components/ui/dialog/cDialog";
import dayjs from "@/lib/dayjs";
import { useBehavioralMapSave } from "@/lib/serverFunctions/apiCalls/behavioralMapProtocol";
import type {
  SaveBehavioralMapData,
  SaveBehavioralMapResponse,
} from "@/lib/serverFunctions/mutations/behavioralMapSubmission";
import type { FormSubmissionData } from "@/lib/serverFunctions/mutations/formSubmission";
import type { Dayjs } from "dayjs";
import { useRouter } from "next-nprogress-bar";
import { useEffect, useState } from "react";

const BehavioralMapSaveDialog = ({
  open,
  behavioralMapId,
  formSubmission,
  observations,
  observationLinks,
  responseGeometryLinks,
  groups,
  startDate,
  endDate,
  isFinalized,
  onSaveSuccess,
  onEndDateChange,
  onIsFinalizedChange,
  onClose,
}: {
  open: boolean;
  behavioralMapId: number;
  formSubmission?: FormSubmissionData;
  observations: SaveBehavioralMapData["observations"];
  observationLinks: SaveBehavioralMapData["observationLinks"];
  responseGeometryLinks: SaveBehavioralMapData["responseGeometryLinks"];
  groups: SaveBehavioralMapData["groups"];
  startDate: Dayjs;
  endDate: Dayjs | null;
  isFinalized: boolean;
  onSaveSuccess: (data: SaveBehavioralMapResponse) => Promise<void>;
  onEndDateChange: (value: Dayjs | null) => void;
  onIsFinalizedChange: (value: boolean) => void;
  onClose: () => void;
}) => {
  const router = useRouter();
  const { isConnected } = useNetwork();
  const { setLoadingOverlay } = useLoadingOverlay();
  const [showDatePickerError, setShowDatePickerError] = useState(false);
  const [saveBehavioralMap, isSaving] = useBehavioralMapSave();

  const save = async () => {
    if (isFinalized && !endDate) {
      setShowDatePickerError(true);
      return;
    }

    setLoadingOverlay({
      show: true,
      message: "Salvando mapa comportamental...",
    });
    try {
      const response = await saveBehavioralMap({
        data: {
          behavioralMapId,
          formSubmission,
          observations,
          observationLinks,
          responseGeometryLinks,
          groups,
          startDate: startDate.toDate(),
          endDate: endDate?.toDate() ?? null,
          isFinalized,
        },
      });
      const data = response.data;
      if (!data) return;

      await onSaveSuccess(data);
      onClose();
      if (data.savedAsFinalized) router.push("/admin/behavioralMaps");
    } finally {
      setLoadingOverlay({ show: false });
    }
  };

  useEffect(() => {
    if (!open) return;
    setShowDatePickerError(false);
  }, [open]);

  useEffect(() => {
    if (isFinalized && !endDate) onEndDateChange(dayjs());
  }, [endDate, isFinalized, onEndDateChange]);

  return (
    <CDialog
      open={open}
      onClose={onClose}
      title="Salvar mapa comportamental"
      confirmChildren="Salvar"
      confirmProps={{ disabled: !isConnected || isSaving }}
      onConfirm={() => void save()}
    >
      <div className="flex w-full flex-col gap-1">
        <CSwitch
          checked={isFinalized}
          label="Salvar como finalizado"
          onChange={(event) => onIsFinalizedChange(event.target.checked)}
        />
        <CDateTimePicker
          value={endDate}
          error={showDatePickerError}
          clearable
          onChange={(value) => {
            setShowDatePickerError(false);
            onEndDateChange(value);
          }}
          label="Data final"
        />
      </div>
    </CDialog>
  );
};

export default BehavioralMapSaveDialog;
