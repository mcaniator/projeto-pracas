"use client";

import { useUserContext } from "@/components/context/UserContext";
import { useHelperCard } from "@/components/context/helperCardContext";
import { useLoadingOverlay } from "@/components/context/loadingContext";
import CDateTimePicker from "@/components/ui/cDateTimePicker";
import CSwitch from "@/components/ui/cSwtich";
import CDialog from "@/components/ui/dialog/cDialog";
import { dexieDb } from "@/lib/dexie/dexie";
import { useSaveOngoingTallyData } from "@/lib/serverFunctions/apiCalls/tally";
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
  isFinalized,
  serverUpdatedAt,
  onEndDateChange,
  onIsFinalizedChange,
  onSaveSuccess,
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
  isFinalized: boolean;
  serverUpdatedAt: Date;
  onEndDateChange: (date: Dayjs | null) => void;
  onIsFinalizedChange: (isFinalized: boolean) => void;
  onSaveSuccess?: (newServerUpdatedAt: Date) => void;
}) => {
  const router = useRouter();
  const { setLoadingOverlay } = useLoadingOverlay();
  const { helperCardProcessResponse, setHelperCard } = useHelperCard();
  const { user } = useUserContext();
  const [errorOnServerSave, setErrorOnServerSave] = useState(false);
  const [errorOnLocalSave, setErrorOnLocalSave] = useState(false);
  const [showDatePickerError, setShowDatePickerError] = useState(false);
  const [saveOngoingTallyData] = useSaveOngoingTallyData();

  const save = async () => {
    if (isFinalized && !endDate) {
      setShowDatePickerError(true);
      return;
    }
    setLoadingOverlay({ show: true, message: "Salvando contagem..." });
    try {
      // Save locally, to not lose data if something goes wrong in the server
      await dexieDb.tallys.put({
        id: tallyId,
        userId: user.id,
        username: user.username ?? "",
        serverUpdatedAt: serverUpdatedAt,
        localUpdatedAt: new Date(),
        isFinalized,
        startDate: startDate.toDate(),
        endDate: endDate?.toDate() ?? null,
        weatherStats,
        tallyMap: Object.fromEntries([...tallyMap.entries()]),
        commercialActivities,
        complementaryData,
      });
      setErrorOnLocalSave(false);
    } catch (e) {
      setHelperCard({
        show: true,
        content: "Erro ao salvar dados locais!",
        helperCardType: "ERROR",
      });
      setErrorOnLocalSave(true);
      setLoadingOverlay({ show: false });
      return;
    }

    try {
      const response = await saveOngoingTallyData({
        data: {
          tallyId,
          weatherStats,
          tallyMapEntries: [...tallyMap.entries()],
          commercialActivities,
          complementaryData,
          startDate: startDate.toDate(),
          endDate: endDate?.toDate() ?? null,
          isFinalized,
        },
      });
      // TODO: Refresh server data in TallyInProgressPage
      helperCardProcessResponse(response.responseInfo);
      if (response.responseInfo.statusCode !== 200) {
        setErrorOnServerSave(true);
      } else {
        setErrorOnServerSave(false);
        try {
          // Delete local data, as it is no longer needed
          await dexieDb.tallys.delete(tallyId);
        } catch (e) {
          setHelperCard({
            show: true,
            helperCardType: "ERROR",
            content: <>Avaliação salva, mas falha ao excluir do dispositivo!</>,
          });
        }

        if (response.data?.updatedAt) {
          onSaveSuccess?.(new Date(response.data.updatedAt));
        }
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
      setErrorOnServerSave(true);
    } finally {
      setLoadingOverlay({ show: false });
    }
  };

  const generateExport = () => {
    const data = {
      weatherStats,
      tallyMap: Object.fromEntries(tallyMap),
      commercialActivities,
      complementaryData,
      startDate: startDate.toDate(),
      endDate: endDate?.toDate() ?? null,
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
    if (open) {
      setErrorOnServerSave(false);
      setErrorOnLocalSave(false);
      setShowDatePickerError(false);
    }
  }, [open]);

  useEffect(() => {
    if (isFinalized && !endDate) {
      onEndDateChange(dayjs(new Date()));
    }
  }, [isFinalized, onEndDateChange, endDate]);

  return (
    <CDialog
      open={open}
      onClose={onClose}
      title="Salvar contagem"
      cancelChildren={"Exportar"}
      confirmChildren={errorOnServerSave ? "Tentar novamente" : "Salvar"}
      onConfirm={() => {
        void save();
      }}
      onCancel={() => {
        generateExport();
      }}
    >
      <div className="flex w-full flex-col gap-1">
        {(errorOnServerSave || errorOnLocalSave) && (
          <div className="flex w-full flex-col gap-1">
            <p className="text-red-500">
              {"Ocorreu um erro ao salvar a contagem no servidor."}
            </p>
            {errorOnLocalSave ?
              <p className="text-red-500">
                {
                  "Os dados da avaliação não foram salvos neste navegador. Exporte a contagem para não perder os dados."
                }
              </p>
            : <p>
                {
                  "Os dados da avaliação foram salvos neste navegador. Ao acessar esta contagem novamente por este navegador, os dados serão carregados."
                }
              </p>
            }
            <p>
              {
                ' Caso deseje tentar novamente, clique em "Tentar novamente". Caso deseje exportar os dados desta contagem, clique em "Exportar".'
              }
            </p>
          </div>
        )}
        <CSwitch
          checked={isFinalized}
          label="Salvar como finalizado"
          onChange={(e) => {
            onIsFinalizedChange(e.target.checked);
          }}
        />
        <CDateTimePicker
          value={endDate}
          error={showDatePickerError}
          clearable
          onChange={(e) => {
            setShowDatePickerError(false);
            onEndDateChange(e);
          }}
          label="Data final"
        />
      </div>
    </CDialog>
  );
};

export default TallyInProgressSaveDialog;
