"use client";

import { useHelperCard } from "@/components/context/helperCardContext";
import { useLoadingOverlay } from "@/components/context/loadingContext";
import CDateTimePicker from "@/components/ui/cDateTimePicker";
import CSwitch from "@/components/ui/cSwtich";
import CDialog from "@/components/ui/dialog/cDialog";
import { _saveOngoingTallyData } from "@/lib/serverFunctions/serverActions/tallyUtil";
import { WeatherStats } from "@/lib/types/tallys/ongoingTally";
import { CommercialActivity } from "@/lib/zodValidators";
import dayjs, { Dayjs } from "dayjs";
import { useRouter } from "next-nprogress-bar";
import { useEffect, useState } from "react";

const TallyInProgressSaveDialog = ({
  open,
  onClose,
  tallyId,
  locationName,
  weatherStats,
  complementaryData,
  commercialActivities,
  tallyMap,
  startDate,
  endDate,
  finalizedTally,
  setEndDate,
  setIsFinalized,
}: {
  open: boolean;
  onClose: () => void;
  tallyId: number;
  locationName: string;
  weatherStats: WeatherStats;
  complementaryData: {
    animalsAmount: number;
    groupsAmount: number;
  };
  commercialActivities: CommercialActivity;
  tallyMap: Map<string, number>;
  startDate: Dayjs;
  endDate: Dayjs | null;
  finalizedTally: boolean;
  setEndDate: React.Dispatch<React.SetStateAction<Dayjs | null>>;
  setIsFinalized: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const router = useRouter();
  const { setLoadingOverlay } = useLoadingOverlay();
  const { helperCardProcessResponse, setHelperCard } = useHelperCard();
  const [enableJsonSaving, setEnableJsonSaving] = useState(false);
  const [showDatePickerError, setShowDatePickerError] = useState(false);
  const [dateTime, setDateTime] = useState<Dayjs | null>(endDate);
  const [isFinalized, updateIsFinalized] = useState(finalizedTally);

  const save = async () => {
    if (isFinalized && !dateTime) {
      setShowDatePickerError(true);
      return;
    }
    setLoadingOverlay({ show: true, message: "Salvando contagem" });
    try {
      const response = await _saveOngoingTallyData({
        tallyId,
        weatherStats,
        tallyMap,
        commercialActivities,
        complementaryData,
        startDate: startDate.toDate(),
        endDate: dateTime?.toDate() ?? null,
        isFinalized,
      });
      helperCardProcessResponse(response.responseInfo);
      if (response.responseInfo.statusCode !== 200) {
        setEnableJsonSaving(true);
      } else {
        setEnableJsonSaving(false);
        setEndDate(dateTime);
        setIsFinalized(isFinalized);
        onClose();
        if (response.data?.savedAsFinalized) {
          router.push(`/admin/tallys`);
        }
      }
    } catch (e) {
      setHelperCard({
        show: true,
        helperCardType: "ERROR",
        content: <>Erro ao salvar contagem!</>,
      });
      setEnableJsonSaving(true);
    }
    setLoadingOverlay({ show: false });
  };

  const generateExport = () => {
    const data = {
      weatherStats,
      tallyMap: Object.fromEntries(tallyMap),
      commercialActivities,
      complementaryData,
      startDate: startDate.toDate(),
      endDate: dateTime?.toDate() ?? null,
      isFinalized,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `contagem_${locationName}_${new Date().toISOString()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    setDateTime(endDate);
    updateIsFinalized(finalizedTally);
    setEnableJsonSaving(false);
    setShowDatePickerError(false);
  }, [endDate, finalizedTally, open]);

  useEffect(() => {
    if (isFinalized) {
      setDateTime((prev) => prev ?? dayjs(new Date()));
    }
  }, [isFinalized]);

  return (
    <CDialog
      open={open}
      onClose={onClose}
      title="Salvar contagem"
      cancelChildren={enableJsonSaving ? <>Tentar novamente</> : undefined}
      confirmChildren={enableJsonSaving ? <>Salvar offline</> : <>Salvar</>}
      onConfirm={() => {
        if (enableJsonSaving) {
          generateExport();
        } else {
          void save();
        }
      }}
      onCancel={() => {
        void save();
      }}
    >
      <div className="flex w-full flex-col gap-1">
        {enableJsonSaving && (
          <div className="flex w-full flex-col gap-1">
            <p>{"Ocorreu um erro ao salvar a contagem."}</p>
            <p>
              {
                'Clique em "Salvar offline" para salvar a contagem em seu dispositivo.'
              }
            </p>
            <p>
              {" "}
              {"Com este arquivo, e possivel enviar a contagem posteriormente."}
            </p>
          </div>
        )}
        <CSwitch
          checked={isFinalized}
          label="Salvar como finalizado"
          onChange={(e) => {
            updateIsFinalized(e.target.checked);
          }}
        />
        <CDateTimePicker
          value={dateTime}
          error={showDatePickerError}
          clearable
          onChange={(e) => {
            setShowDatePickerError(false);
            setDateTime(e);
          }}
          label="Data final"
        />
      </div>
    </CDialog>
  );
};

export default TallyInProgressSaveDialog;
