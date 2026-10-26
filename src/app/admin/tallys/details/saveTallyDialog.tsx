"use client";

import { deleteTallyDraft } from "@/app/admin/tallys/details/tallyDraft";
import { useLoadingOverlay } from "@/components/context/loadingContext";
import { useNetwork } from "@/components/context/networkContext";
import CDateTimePicker from "@/components/ui/cDateTimePicker";
import CSwitch from "@/components/ui/cSwtich";
import CDialog from "@/components/ui/dialog/cDialog";
import dayjs from "@/lib/dayjs";
import { useTallySubmit } from "@/lib/serverFunctions/apiCalls/tally";
import type { FormSubmissionData } from "@/lib/serverFunctions/mutations/formSubmission";
import type {
  TallySubmitData,
  TallySubmitResponse,
} from "@/lib/serverFunctions/mutations/tally";
import type { Dayjs } from "dayjs";
import { useRouter } from "next-nprogress-bar";
import { enqueueSnackbar } from "notistack";
import { useEffect, useState } from "react";

const SaveTallyDialog = ({
  open,
  tallyId,
  formSubmission,
  personObservations,
  startDate,
  isFinalized,
  endDate,
  onSaveSuccess,
  onIsFinalizedChange,
  onEndDateChange,
  onClose,
}: {
  open: boolean;
  tallyId: number;
  formSubmission?: FormSubmissionData;
  personObservations: TallySubmitData["personObservations"];
  startDate: Dayjs;
  isFinalized: boolean;
  endDate: Dayjs | null;
  onSaveSuccess: (data: TallySubmitResponse) => void;
  onIsFinalizedChange: (value: boolean) => void;
  onEndDateChange: (value: Dayjs | null) => void;
  onClose: () => void;
}) => {
  const router = useRouter();
  const { isConnected } = useNetwork();
  const { setLoadingOverlay } = useLoadingOverlay();
  const [showDatePickerError, setShowDatePickerError] = useState(false);
  const [submitTally] = useTallySubmit({
    callbacks: {
      onSuccess: (response) => {
        const data = response.data;
        if (!data) return;
        deleteTallyDraft(tallyId)
          .catch(() => {
            enqueueSnackbar(
              "Contagem salva, mas houve uma falha ao excluir o rascunho!",
              { variant: "error" },
            );
          })
          .finally(() => {
            onSaveSuccess(data);
            onClose();

            if (data.savedAsFinalized) {
              router.push("/admin/tallys");
            }
          });
      },
    },
  });

  const save = async () => {
    if (isFinalized && !endDate) {
      setShowDatePickerError(true);
      return;
    }

    setLoadingOverlay({ show: true, message: "Salvando contagem..." });
    try {
      await submitTally({
        data: {
          tallyId,
          formSubmission,
          personObservations,
          startDate: startDate.toDate(),
          endDate: endDate?.toDate() ?? null,
          isFinalized,
        },
      });
    } finally {
      setLoadingOverlay({ show: false });
    }
  };

  useEffect(() => {
    if (!open) return;
    setShowDatePickerError(false);
  }, [open]);

  useEffect(() => {
    if (isFinalized && !endDate) {
      onEndDateChange(dayjs());
    }
  }, [endDate, isFinalized, onEndDateChange]);

  return (
    <CDialog
      open={open}
      onClose={onClose}
      title="Salvar contagem"
      confirmChildren="Salvar"
      confirmProps={{ disabled: !isConnected }}
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

export default SaveTallyDialog;
