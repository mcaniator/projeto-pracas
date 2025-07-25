import { weatherNameMap } from "@/lib/translationMaps/tallys";
import { Button } from "@components/button";
import { WeatherStats } from "@customTypes/tallys/ongoingTally";
import { CommercialActivity, OngoingTally } from "@lib/zodValidators";
import { WeatherConditions } from "@prisma/client";
import { useState } from "react";

import { TallyInProgressCharts } from "./tallyInProgressCharts";
import { TallyInProgressDatabaseOptions } from "./tallyInProgressDatabaseOptions";
import { SubmittingObj } from "./tallyInProgressPage";
import { TallyInProgressTextualData } from "./tallyInProgressTextualData";

type AssistBarStates = "TEXTUAL_DATA" | "CHARTS" | "SAVE_DELETE";

const TallyInProgressReview = ({
  submittingObj,
  tallyId,
  locationId,
  tally,
  weatherStats,
  complementaryData,
  commercialActivities,
  tallyMap,
  setSubmittingObj,
}: {
  submittingObj: {
    submitting: boolean;
    finishing: boolean;
    deleting: boolean;
  };
  tallyId: number;
  locationId: number;
  tally: OngoingTally;
  weatherStats: WeatherStats;
  complementaryData: {
    animalsAmount: number;
    groupsAmount: number;
  };
  commercialActivities: CommercialActivity;
  tallyMap: Map<string, number>;
  setSubmittingObj: React.Dispatch<React.SetStateAction<SubmittingObj>>;
}) => {
  const [assistBarState, setAssistBarState] =
    useState<AssistBarStates>("TEXTUAL_DATA");
  return (
    <div className="flex h-full flex-col gap-1 p-3">
      <h4 className="text-xl font-semibold">Acompanhamento</h4>
      <div>
        <div className="inline-flex w-auto gap-1 rounded-xl bg-gray-400/20 py-1 shadow-inner">
          <Button
            isDisabled={submittingObj.submitting}
            variant={"ghost"}
            onPress={() => setAssistBarState("TEXTUAL_DATA")}
            className={`rounded-xl px-4 py-1 ${assistBarState === "TEXTUAL_DATA" ? "bg-gray-200/20 shadow-md" : "bg-gray-400/0 shadow-none"}`}
          >
            Dados textuais
          </Button>
          <Button
            isDisabled={submittingObj.submitting}
            variant={"ghost"}
            onPress={() => setAssistBarState("CHARTS")}
            className={`rounded-xl bg-blue-500 px-4 py-1 ${assistBarState === "CHARTS" ? "bg-gray-200/20 shadow-md" : "bg-gray-400/0 shadow-none"}`}
          >
            Gráficos
          </Button>
          <Button
            isDisabled={submittingObj.submitting}
            variant={"ghost"}
            onPress={() => setAssistBarState("SAVE_DELETE")}
            className={`rounded-xl bg-blue-500 px-4 py-1 ${assistBarState === "SAVE_DELETE" ? "bg-gray-200/20 shadow-md" : "bg-gray-400/0 shadow-none"}`}
          >
            Salvar/Excluir
          </Button>
        </div>
      </div>
      {assistBarState === "TEXTUAL_DATA" && (
        <TallyInProgressTextualData
          tally={tally}
          temperature={weatherStats.temperature}
          weather={
            weatherNameMap.get(weatherStats.weather) as WeatherConditions
          }
          complementaryData={complementaryData}
          commercialActivities={commercialActivities}
        />
      )}
      {assistBarState === "CHARTS" && (
        <TallyInProgressCharts tallyMap={tallyMap} isOnModal={false} />
      )}
      {assistBarState === "SAVE_DELETE" && (
        <TallyInProgressDatabaseOptions
          tallyId={tallyId}
          locationId={locationId}
          tallyMap={tallyMap}
          weatherStats={weatherStats}
          commercialActivities={commercialActivities}
          complementaryData={complementaryData}
          submittingObj={submittingObj}
          setSubmittingObj={setSubmittingObj}
        />
      )}
    </div>
  );
};

export default TallyInProgressReview;
export { type AssistBarStates };
