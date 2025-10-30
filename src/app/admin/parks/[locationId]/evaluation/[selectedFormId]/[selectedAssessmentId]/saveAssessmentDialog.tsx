"use client";

import { Dayjs } from "dayjs";
import { useState } from "react";

import { useHelperCard } from "../../../../../../../components/context/helperCardContext";
import { useLoadingOverlay } from "../../../../../../../components/context/loadingContext";
import CDateTimePicker from "../../../../../../../components/ui/cDateTimePicker";
import CSwitch from "../../../../../../../components/ui/cSwtich";
import CDialog from "../../../../../../../components/ui/dialog/cDialog";
import { _addResponsesV2 } from "../../../../../../../lib/serverFunctions/serverActions/responseUtil";
import { FormValues, ResponseFormGeometry } from "./responseFormV2";

const SaveAssessmentDialog = ({
  open,
  assessmentId,
  formValues,
  geometries,
  onClose,
}: {
  open: boolean;
  assessmentId: number;
  formValues: FormValues;
  geometries: ResponseFormGeometry[];
  onClose: () => void;
}) => {
  const [finalized, setIsFinalized] = useState(false);
  const [dateTime, setDateTime] = useState<Dayjs | null>(null);
  const { setLoadingOverlay } = useLoadingOverlay();
  const { helperCardProcessResponse } = useHelperCard();
  const save = async () => {
    setLoadingOverlay({ show: true, message: "Salvando avaliação" });
    const response = await _addResponsesV2({
      assessmentId,
      responses: formValues,
      geometries: geometries,
      finalizationDate: dateTime?.toDate() ?? null,
    });
    setLoadingOverlay({ show: false });
    helperCardProcessResponse(response.responseInfo);
  };
  return (
    <CDialog
      open={open}
      onClose={onClose}
      title="Salvar"
      confirmChildren={<>Salvar</>}
      onConfirm={() => {
        void save();
      }}
    >
      <div className="flex w-full flex-col gap-1">
        <CSwitch
          label="Salvar como finalizado"
          onChange={(e) => {
            setIsFinalized(e.target.checked);
          }}
        />
        {finalized && (
          <CDateTimePicker
            value={dateTime}
            onChange={(e) => {
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
