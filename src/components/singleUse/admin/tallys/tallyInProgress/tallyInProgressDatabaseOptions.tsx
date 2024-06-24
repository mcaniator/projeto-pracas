"use client";

import { Button } from "@/components/button";
import { Input } from "@/components/ui/input";
import { deleteTallys, saveOngoingTallyData } from "@/serverActions/tallyUtil";
import { WeatherConditions } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import React from "react";

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
interface SubmittingObj {
  submitting: boolean;
  finishing: boolean;
  deleting: boolean;
}
type SaveDeleteState = "DEFAULT" | "SAVE" | "DELETE";
const TallyInProgressDatabaseOptions = ({
  tallyId,
  tallyMap,
  weatherStats,
  commercialActivities,
  complementaryData,
  submittingObj,
  setSubmittingObj,
}: {
  tallyId: number;
  tallyMap: Map<string, number>;
  weatherStats: WeatherStats;
  commercialActivities: CommercialActivitiesObject;
  complementaryData: ComplementaryDataObject;
  submittingObj: SubmittingObj;
  setSubmittingObj: React.Dispatch<React.SetStateAction<SubmittingObj>>;
}) => {
  const endDate = useRef<Date | null>(null);
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

    await saveOngoingTallyData(
      tallyId,
      weatherStats,
      tallyMap,
      commercialActivities,
      complementaryData,
      endTally ? endDate.current : null,
    );
    if (endTally) {
      router.back();
      router.refresh();
    } else {
      setSubmittingObj({
        submitting: false,
        finishing: false,
        deleting: false,
      });
    }
  };

  const handleTallyDeletion = async () => {
    setSubmittingObj({ submitting: true, finishing: false, deleting: true });
    await deleteTallys([tallyId]);
    router.back();
    router.refresh();
  };

  return (
    <div className="flex flex-col gap-3 overflow-auto py-1">
      <div>
        <h5 className="text-xl font-semibold">Salvar dados</h5>
        <Button
          isDisabled={submittingObj.submitting}
          onPress={() => {
            handleDataSubmit(false).catch(() => ({ statusCode: 1 }));
          }}
          variant={"secondary"}
        >
          {(
            submittingObj.submitting &&
            !submittingObj.finishing &&
            !submittingObj.deleting
          ) ?
            "Salvando..."
          : "Salvar"}
        </Button>
      </div>
      <div>
        <h5 className="text-xl font-semibold">Finalizar contagem</h5>
        <div className="flex flex-col gap-2">
          <div className="flex flex-row items-center gap-1">
            <label htmlFor="end-date">Fim da contagem em:</label>
            <Input
              className={
                validEndDate ?
                  "w-auto outline-none"
                : "w-auto outline outline-red-500"
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
          <Button
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
              //handleDataSubmit(true).catch(() => ({ statusCode: 0 }));
            }}
          >
            {submittingObj.finishing ? "Salvando..." : "Salvar e finalizar"}
          </Button>
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
