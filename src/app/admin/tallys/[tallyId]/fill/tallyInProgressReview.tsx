import CToggleButtonGroup from "@/components/ui/cToggleButtonGroup";
import { weatherNameMap } from "@/lib/translationMaps/tallys";
import { WeatherStats } from "@customTypes/tallys/ongoingTally";
import { CommercialActivity, OngoingTally } from "@lib/zodValidators";
import { WeatherConditions } from "@prisma/client";
import { Dayjs } from "dayjs";
import { useState } from "react";

import { TallyInProgressCharts } from "./tallyInProgressCharts";
import { TallyInProgressDatabaseOptions } from "./tallyInProgressDatabaseOptions";
import { SubmittingObj } from "./tallyInProgressPage";
import { TallyInProgressTextualData } from "./tallyInProgressTextualData";

type AssistBarStates = "TEXTUAL_DATA" | "CHARTS" | "SAVE_DELETE";

const assistBarOptions: { label: string; value: AssistBarStates }[] = [
  { label: "Dados textuais", value: "TEXTUAL_DATA" },
  { label: "Gráficos", value: "CHARTS" },
  { label: "Salvar/Excluir", value: "SAVE_DELETE" },
];

const TallyInProgressReview = ({
  submittingObj,
  tallyId,
  locationId,
  locationName,
  tally,
  weatherStats,
  complementaryData,
  commercialActivities,
  tallyMap,
  startDate,
  endDate,
  finalizedTally,
  setStartDate,
  setEndDate,
  setSubmittingObj,
}: {
  submittingObj: {
    submitting: boolean;
    finishing: boolean;
    deleting: boolean;
  };
  tallyId: number;
  locationId: number;
  locationName: string;
  tally: OngoingTally;
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
  setStartDate: React.Dispatch<React.SetStateAction<Dayjs>>;
  setEndDate: React.Dispatch<React.SetStateAction<Dayjs | null>>;
  setSubmittingObj: React.Dispatch<React.SetStateAction<SubmittingObj>>;
}) => {
  const [assistBarState, setAssistBarState] =
    useState<AssistBarStates>("TEXTUAL_DATA");
  return (
    <div className="flex h-full flex-col gap-1 p-3">
      <h4 className="text-xl font-semibold">Acompanhamento</h4>
      <CToggleButtonGroup
        options={assistBarOptions}
        value={assistBarState}
        getLabel={(i) => i.label}
        getValue={(i) => i.value}
        onChange={(_, v) => setAssistBarState(v.value)}
      />

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
          locationName={locationName}
          tallyMap={tallyMap}
          weatherStats={weatherStats}
          commercialActivities={commercialActivities}
          complementaryData={complementaryData}
          submittingObj={submittingObj}
          startDate={startDate}
          endDate={endDate}
          finalizedTally={finalizedTally}
          setStartDate={setStartDate}
          setEndDate={setEndDate}
          setSubmittingObj={setSubmittingObj}
        />
      )}
    </div>
  );
};

export default TallyInProgressReview;
export { type AssistBarStates };
