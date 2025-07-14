"use client";

import { Button } from "@/components/button";
import { Input } from "@/components/ui/input";
import LoadingIcon from "@components/LoadingIcon";
import { useHelperCard } from "@components/context/helperCardContext";
import { WeatherConditions } from "@prisma/client";
import {
  _deleteTallys,
  _redirectToTallysList,
  _saveOngoingTallyData,
} from "@serverActions/tallyUtil";
import { useRef, useState } from "react";
import React from "react";

import { SubmittingObj } from "./tallyInProgressPage";

interface WeatherStats {
  temperature: number | null;
  weather: WeatherConditions;
}
interface CommercialActivitiesObject {
  [key: string]: number;
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
  setSubmittingObj,
}: {
  tallyId: number;
  locationId: number;
  tallyMap: Map<string, number>;
  weatherStats: WeatherStats;
  commercialActivities: CommercialActivitiesObject;
  complementaryData: ComplementaryDataObject;
  submittingObj: SubmittingObj;
  setSubmittingObj: React.Dispatch<React.SetStateAction<SubmittingObj>>;
}) => {
  const { setHelperCard } = useHelperCard();
  const endDate = useRef<Date | null>(null);
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
      const response = await _saveOngoingTallyData(
        tallyId,
        weatherStats,
        tallyMap,
        commercialActivities,
        complementaryData,
        endTally ? endDate.current : null,
      );
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
      if (endTally) {
        _redirectToTallysList(locationId);
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
    _redirectToTallysList(locationId);
  };

  return (
    <div className="flex flex-col gap-3 overflow-auto py-1">
      <div>
        <h5 className="text-xl font-semibold">Salvar dados</h5>
        {(
          submittingObj.submitting &&
          !submittingObj.finishing &&
          !submittingObj.deleting
        ) ?
          <LoadingIcon className="h-32 w-32" />
        : <Button
            isDisabled={submittingObj.submitting}
            onPress={() => {
              handleDataSubmit(false).catch(() => ({ statusCode: 1 }));
            }}
            variant={"secondary"}
          >
            Salvar
          </Button>
        }
      </div>
      <div>
        <h5 className="text-xl font-semibold">Finalizar contagem</h5>
        <div className="flex flex-col gap-2">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center">
            <label htmlFor="end-date">Fim da contagem em:</label>
            <Input
              className={
                validEndDate ?
                  "w-auto outline-none"
                : "w-auto outline outline-redwood"
              }
              onChange={(e) => {
                endDate.current = new Date(e.target.value);
                if (!validEndDate && endDate.current) {
                  setValidEndDate(true);
                }
              }}
              id="end-date"
              type="datetime-local"
            ></Input>
          </div>
          {submittingObj.finishing ?
            <LoadingIcon className="h-32 w-32" />
          : <Button
              className="w-48"
              isDisabled={submittingObj.submitting}
              variant={"constructive"}
              onPress={() => {
                if (!endDate.current || isNaN(endDate.current.getTime())) {
                  setValidEndDate(false);
                  return;
                } else {
                  setSaveDeleteState("SAVE");
                }
              }}
            >
              Salvar e finalizar
            </Button>
          }

          {saveDeleteState === "SAVE" && (
            <React.Fragment>
              <p>
                Salvar dados e finalizar contagem?
                <br />
                Dados não poderão ser modificados posteriormente!
              </p>
              <div className="flex flex-row gap-3">
                <Button
                  isDisabled={submittingObj.submitting}
                  variant={"constructive"}
                  onPress={() => {
                    if (!endDate.current || isNaN(endDate.current.getTime())) {
                      setValidEndDate(false);
                      return;
                    } else {
                      handleDataSubmit(true).catch(() => ({ statusCode: 1 }));
                    }
                  }}
                >
                  {submittingObj.finishing ? "Salvando..." : "Confirmar"}
                </Button>
                <Button
                  isDisabled={submittingObj.submitting}
                  variant={"secondary"}
                  onPress={() => setSaveDeleteState("DEFAULT")}
                >
                  Cancelar
                </Button>
              </div>
            </React.Fragment>
          )}
        </div>
      </div>
      <div>
        <h5 className="text-xl font-semibold">Excluir contagem</h5>
        <div className="flex flex-col gap-2">
          <Button
            isDisabled={submittingObj.submitting}
            className="w-32"
            variant={"destructive"}
            onPress={() => setSaveDeleteState("DELETE")}
          >
            {submittingObj.deleting ? "Excluindo..." : "Excluir"}
          </Button>
          {saveDeleteState === "DELETE" && (
            <React.Fragment>
              <p>
                Excluir contagem?
                <br />
                Todos os dados desta contagem serão perdidos!
              </p>
              <div className="flex flex-row gap-3">
                <Button
                  isDisabled={submittingObj.submitting}
                  variant={"destructive"}
                  onPress={() => {
                    handleTallyDeletion().catch(() => ({ statusCode: 1 }));
                  }}
                >
                  {submittingObj.deleting ?
                    "Excluindo..."
                  : "Confirmar e excluir"}
                </Button>
                <Button
                  isDisabled={submittingObj.submitting}
                  variant={"secondary"}
                  onPress={() => setSaveDeleteState("DEFAULT")}
                >
                  Cancelar
                </Button>
              </div>
            </React.Fragment>
          )}
        </div>
      </div>
    </div>
  );
};

export { TallyInProgressDatabaseOptions };
