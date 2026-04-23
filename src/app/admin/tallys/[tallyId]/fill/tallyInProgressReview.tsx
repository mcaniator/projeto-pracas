import CToggleButtonGroup from "@/components/ui/cToggleButtonGroup";
import { weatherNameMap } from "@/lib/translationMaps/tallys";
import { WeatherStats } from "@customTypes/tallys/ongoingTally";
import { CommercialActivity, OngoingTally } from "@lib/zodValidators";
import { WeatherConditions } from "@prisma/client";
import { Dayjs } from "dayjs";
import { useState } from "react";

import { TallyInProgressCharts } from "./tallyInProgressCharts";
import { TallyInProgressDatabaseOptions } from "./tallyInProgressDatabaseOptions";
import { TallyInProgressTextualData } from "./tallyInProgressTextualData";

type AssistBarStates = "TEXTUAL_DATA" | "CHARTS" | "SAVE";

const assistBarOptions: { label: string; value: AssistBarStates }[] = [
  { label: "Dados textuais", value: "TEXTUAL_DATA" },
  { label: "Graficos", value: "CHARTS" },
  { label: "Salvar", value: "SAVE" },
];

const TallyInProgressReview = ({
  tally,
  weatherStats,
  complementaryData,
  commercialActivities,
  tallyMap,
  startDate,
  setStartDate,
  onOpenSaveDialog,
}: {
  tally: OngoingTally;
  weatherStats: WeatherStats;
  complementaryData: {
    animalsAmount: number;
    groupsAmount: number;
  };
  commercialActivities: CommercialActivity;
  tallyMap: Map<string, number>;
  startDate: Dayjs;
  setStartDate: React.Dispatch<React.SetStateAction<Dayjs>>;
  onOpenSaveDialog: () => void;
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
      {assistBarState === "SAVE" && (
        <TallyInProgressDatabaseOptions
          startDate={startDate}
          setStartDate={setStartDate}
          onOpenSaveDialog={onOpenSaveDialog}
        />
      )}
    </div>
  );
};

export default TallyInProgressReview;
export { type AssistBarStates };
