"use client";

import { useHelperCard } from "@/components/context/helperCardContext";
import { useLoadingOverlay } from "@/components/context/loadingContext";
import CDateTimePicker from "@/components/ui/cDateTimePicker";
import CSwitch from "@/components/ui/cSwtich";
import CDialog from "@/components/ui/dialog/cDialog";
import { _addResponsesV2 } from "@/lib/serverFunctions/serverActions/responseUtil";
import { Dayjs } from "dayjs";
import { useRouter } from "next-nprogress-bar";
import { useEffect, useState } from "react";

import { FormValues, ResponseFormGeometry } from "./responseFormV2";

const SaveAssessmentDialog = ({
  open,
  locationName,
  assessmentId,
  formValues,
  geometries,
  importedFinalizationDatetime,
  onClose,
}: {
  open: boolean;
  locationName: string;
  assessmentId: number;
  formValues: FormValues;
  geometries: ResponseFormGeometry[];
  importedFinalizationDatetime: Dayjs | null;
  onClose: () => void;
}) => {
  const [enableJsonSaving, setEnableJsonSaving] = useState(false);
  const [showDatePickerError, setShowDatePickerError] = useState(false);
  const router = useRouter();
  const [finalized, setIsFinalized] = useState(!!importedFinalizationDatetime);
  const [dateTime, setDateTime] = useState<Dayjs | null>(
    importedFinalizationDatetime,
  );
  const { setLoadingOverlay } = useLoadingOverlay();
  const { helperCardProcessResponse, setHelperCard } = useHelperCard();
  const save = async () => {
    if (finalized && !dateTime) {
      setShowDatePickerError(true);
      return;
    }
    setLoadingOverlay({ show: true, message: "Salvando avaliação" });
    try {
      const response = await _addResponsesV2({
        assessmentId,
        responses: formValues,
        geometries: geometries,
        finalizationDate: finalized ? (dateTime?.toDate() ?? null) : null,
      });
      helperCardProcessResponse(response.responseInfo);
      if (response.responseInfo.statusCode !== 201) {
        setEnableJsonSaving(true);
      } else {
        if (finalized) {
          router.refresh();
        }
      }
    } catch (e) {
      setHelperCard({
        show: true,
        helperCardType: "ERROR",
        content: <>Erro ao salvar avaliação!</>,
      });
      setEnableJsonSaving(true);
    }

    setLoadingOverlay({ show: false });
  };

  const generateExport = () => {
    const data = {
      finalizationDateTime: finalized ? (dateTime ?? null) : null,
      assessmentId: assessmentId,
      responses: formValues,
      geometries: geometries,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `avaliação_${locationName}_${new Date().toISOString()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    setDateTime(importedFinalizationDatetime);
    setIsFinalized(!!importedFinalizationDatetime);
  }, [importedFinalizationDatetime]);

  return (
    <CDialog
      open={open}
      onClose={onClose}
      title={"Salvar avaliação"}
      confirmChildren={enableJsonSaving ? <>Salvar offline</> : <>Salvar</>}
      onConfirm={() => {
        if (enableJsonSaving) {
          generateExport();
        } else {
          void save();
        }
      }}
    >
      <div className="flex w-full flex-col gap-1">
        {enableJsonSaving && (
          <div className="flex w-full flex-col gap-1">
            <p>{"Ocorreu um erro ao salvar a avaliação."}</p>
            <p>
              {
                'Clique em "SALVAR OFFLINE" para salvar a avaliação em seu dispositivo.'
              }
            </p>
            <p>
              {
                "Com este arquivo, é possível enviar a avaliação posteriormente."
              }
            </p>
          </div>
        )}
        <CSwitch
          checked={finalized}
          label="Salvar como finalizado"
          onChange={(e) => {
            setIsFinalized(e.target.checked);
          }}
        />
        {finalized && (
          <CDateTimePicker
            value={dateTime}
            error={showDatePickerError}
            onChange={(e) => {
              setShowDatePickerError(false);
              setDateTime(e);
            }}
            label="Finalizado em"
          />
        )}
      </div>
    </CDialog>
  );
};

export default SaveAssessmentDialog;
