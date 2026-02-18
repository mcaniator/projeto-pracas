"use client";

import CButton from "@/components/ui/cButton";
import CDateTimePicker from "@/components/ui/cDateTimePicker";
import { useHelperCard } from "@components/context/helperCardContext";
import { WeatherConditions } from "@prisma/client";
import { _deleteTallys, _saveOngoingTallyData } from "@serverActions/tallyUtil";
import {
  IconCancel,
  IconCheck,
  IconDeviceFloppy,
  IconTrash,
  IconTrashX,
} from "@tabler/icons-react";
import { CommercialActivity } from "@zodValidators";
import { Dayjs } from "dayjs";
import { useRouter } from "next-nprogress-bar";
import { useState } from "react";
import React from "react";

import { SubmittingObj } from "./tallyInProgressPage";

interface WeatherStats {
  temperature: number | null;
  weather: WeatherConditions;
}

interface ComplementaryDataObject {
  animalsAmount: number;
  groupsAmount: number;
}

type SaveDeleteState = "DEFAULT" | "SAVE" | "DELETE";
const TallyInProgressDatabaseOptions = ({
  tallyId,
  locationId,
  tallyMap,
  weatherStats,
  commercialActivities,
  complementaryData,
  submittingObj,
  startDate,
  endDate,
  finalizedTally,
  setStartDate,
  setEndDate,
  setSubmittingObj,
}: {
  tallyId: number;
  locationId: number;
  tallyMap: Map<string, number>;
  weatherStats: WeatherStats;
  commercialActivities: CommercialActivity;
  complementaryData: ComplementaryDataObject;
  submittingObj: SubmittingObj;
  startDate: Dayjs;
  endDate: Dayjs | null;
  finalizedTally: boolean;
  setStartDate: React.Dispatch<React.SetStateAction<Dayjs>>;
  setEndDate: React.Dispatch<React.SetStateAction<Dayjs | null>>;
  setSubmittingObj: React.Dispatch<React.SetStateAction<SubmittingObj>>;
}) => {
  const { setHelperCard } = useHelperCard();
  const router = useRouter();
  const [validEndDate, setValidEndDate] = useState(true);
  const [saveDeleteState, setSaveDeleteState] =
    useState<SaveDeleteState>("DEFAULT");
  const handleDataSubmit = async (endTally: boolean) => {
    if (endTally) {
      setSubmittingObj({ submitting: true, finishing: true, deleting: false });
    } else {
      setSubmittingObj({ submitting: true, finishing: false, deleting: false });
    }
    try {
      const response = await _saveOngoingTallyData({
        tallyId,
        weatherStats,
        tallyMap,
        commercialActivities,
        complementaryData,
        endDate: endTally && endDate ? endDate.toDate() : null,
        startDate: startDate.toDate(),
      });
      if (response.statusCode === 401) {
        setHelperCard({
          show: true,
          helperCardType: "ERROR",
          content: <>Sem permissão para salvar contagem!</>,
        });
        return;
      }
      if (response.statusCode === 500) {
        setHelperCard({
          show: true,
          helperCardType: "ERROR",
          content: <>Erro ao salvar contagem!</>,
        });
        return;
      }
      if (response.statusCode === 200) {
        setHelperCard({
          show: true,
          helperCardType: "CONFIRM",
          content: <>Contagem salva com sucesso!</>,
        });
      }
      if (endTally) {
        router.push(`/admin/tallys?locationId=${locationId}`);
      } else {
        setSubmittingObj({
          submitting: false,
          finishing: false,
          deleting: false,
        });
      }
    } catch (e) {
      setHelperCard({
        show: true,
        helperCardType: "ERROR",
        content: <>Erro ao salvar contagem!</>,
      });
    }
  };

  const handleTallyDeletion = async () => {
    setSubmittingObj({ submitting: true, finishing: false, deleting: true });

    try {
      const response = await _deleteTallys([tallyId]);
      if (response.statusCode === 401) {
        setHelperCard({
          show: true,
          helperCardType: "ERROR",
          content: <>Sem permissão para excluir contagem!</>,
        });
        setSubmittingObj({
          submitting: false,
          finishing: false,
          deleting: false,
        });
        return;
      } else if (response.statusCode === 403) {
        setHelperCard({
          show: true,
          helperCardType: "ERROR",
          content: (
            <>Você só possui permissão para excluir as próprias contagens!</>
          ),
        });
        setSubmittingObj({
          submitting: false,
          finishing: false,
          deleting: false,
        });
        return;
      } else if (response.statusCode === 500) {
        setHelperCard({
          show: true,
          helperCardType: "ERROR",
          content: <>Erro ao excluir contagem!</>,
        });
        setSubmittingObj({
          submitting: false,
          finishing: false,
          deleting: false,
        });
        return;
      }
    } catch (e) {
      setHelperCard({
        show: true,
        helperCardType: "ERROR",
        content: <>Erro ao excluir contagem!</>,
      });
      setSubmittingObj({
        submitting: false,
        finishing: false,
        deleting: false,
      });
      return;
    }
    router.push(`/admin/tallys?locationId=${locationId}`);
  };

  return (
    <div className="flex flex-col gap-3 overflow-auto py-1">
      <CDateTimePicker
        label="Início da contagem em:"
        value={startDate}
        onAccept={(e) => {
          if (!e) return;
          setStartDate(e);
        }}
      />
      {!finalizedTally && (
        <div>
          <h5 className="text-xl font-semibold">Salvar dados</h5>

          <CButton
            className="w-fit"
            loading={submittingObj.submitting}
            onClick={() => {
              handleDataSubmit(false).catch(() => ({ statusCode: 1 }));
            }}
          >
            <IconDeviceFloppy /> Salvar
          </CButton>
        </div>
      )}

      <div>
        <h5 className="text-xl font-semibold">Finalizar contagem</h5>
        <div className="flex flex-col gap-2">
          <CDateTimePicker
            value={endDate}
            error={!validEndDate}
            disabled={saveDeleteState === "SAVE"}
            helperText={!validEndDate ? "Obrigatório!" : ""}
            label="Fim da contagem em:"
            onAccept={(e) => {
              setEndDate(e);
              setValidEndDate(true);
            }}
          />
          {saveDeleteState === "DEFAULT" && (
            <CButton
              className="w-fit"
              onClick={() => {
                if (!endDate || !endDate.isValid()) {
                  setValidEndDate(false);
                  return;
                } else {
                  setSaveDeleteState("SAVE");
                }
              }}
            >
              <IconCheck /> Salvar e finalizar
            </CButton>
          )}

          {saveDeleteState === "SAVE" && (
            <React.Fragment>
              <p>Salvar dados e finalizar contagem?</p>

              <CButton
                className="w-fit"
                loading={submittingObj.submitting}
                onClick={() => {
                  if (!endDate || !endDate.isValid()) {
                    setValidEndDate(false);
                    return;
                  } else {
                    handleDataSubmit(true).catch(() => ({ statusCode: 1 }));
                  }
                }}
              >
                <IconCheck /> Confirmar Salvamento
              </CButton>
              <CButton
                className="w-fit"
                color="error"
                disabled={submittingObj.submitting}
                onClick={() => setSaveDeleteState("DEFAULT")}
              >
                <IconCancel /> Cancelar salvamento
              </CButton>
            </React.Fragment>
          )}
        </div>
      </div>
      <div>
        <div className="flex flex-col gap-2">
          {saveDeleteState === "DEFAULT" && (
            <CButton
              className="w-fit"
              color="error"
              onClick={() => setSaveDeleteState("DELETE")}
            >
              <IconTrash /> Excluir
            </CButton>
          )}

          {saveDeleteState === "DELETE" && (
            <React.Fragment>
              <p>
                Excluir contagem?
                <br />
                Todos os dados desta contagem serão perdidos!
              </p>
              <CButton
                className="w-fit"
                loading={submittingObj.submitting}
                color="error"
                onClick={() => {
                  handleTallyDeletion().catch(() => ({ statusCode: 1 }));
                }}
              >
                <IconTrashX /> Confirmar exclusão
              </CButton>
              <CButton
                className="w-fit"
                loading={submittingObj.submitting}
                onClick={() => setSaveDeleteState("DEFAULT")}
              >
                <IconCancel /> Cancelar exclusão
              </CButton>
            </React.Fragment>
          )}
        </div>
      </div>
    </div>
  );
};

export { TallyInProgressDatabaseOptions };
