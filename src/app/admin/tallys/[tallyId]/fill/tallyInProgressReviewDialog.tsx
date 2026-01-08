import { TallyInProgressCharts } from "@/app/admin/tallys/[tallyId]/fill/tallyInProgressCharts";
import { AssistBarStates } from "@/app/admin/tallys/[tallyId]/fill/tallyInProgressReview";
import { TallyInProgressTextualData } from "@/app/admin/tallys/[tallyId]/fill/tallyInProgressTextualData";
import { Button } from "@/components/button";
import CDialog from "@/components/ui/dialog/cDialog";
import { weatherNameMap } from "@/lib/translationMaps/tallys";
import { WeatherStats } from "@/lib/types/tallys/ongoingTally";
import { OngoingTally } from "@/lib/zodValidators";
import { WeatherConditions } from "@prisma/client";
import { IconChartBar, IconLogs } from "@tabler/icons-react";
import { useState } from "react";

const TallyInProgressReviewDialog = ({
  open,
  onClose,
  tally,
  weatherStats,
  complementaryData,
  commercialActivities,
  tallyMap,
}: {
  open: boolean;
  onClose: () => void;
  tally: OngoingTally;
  weatherStats: WeatherStats;
  complementaryData: { animalsAmount: number; groupsAmount: number };
  commercialActivities: Record<string, number>;
  tallyMap: Map<string, number>;
}) => {
  const [modalState, setModalState] = useState<AssistBarStates>("TEXTUAL_DATA");
  return (
    <CDialog open={open} onClose={onClose} fullScreen title="Acompanhamento">
      <div className="flex flex-col gap-2">
        <div className="inline-flex w-fit flex-row gap-1 rounded-xl bg-gray-400/20 py-1 shadow-inner">
          <Button
            variant={"ghost"}
            className={`rounded-xl px-4 py-1 text-black ${modalState === "TEXTUAL_DATA" ? "bg-gray-200/20 shadow-md" : "bg-gray-400/0 shadow-none"}`}
            onPress={() => setModalState("TEXTUAL_DATA")}
          >
            <IconLogs />
          </Button>
          <Button
            variant={"ghost"}
            className={`rounded-xl px-4 py-1 text-black ${modalState === "CHARTS" ? "bg-gray-200/20 shadow-md" : "bg-gray-400/0 shadow-none"}`}
            onPress={() => setModalState("CHARTS")}
          >
            <IconChartBar />
          </Button>
        </div>

        {modalState === "TEXTUAL_DATA" && (
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
        {modalState === "CHARTS" && (
          <TallyInProgressCharts tallyMap={tallyMap} isOnModal={true} />
        )}
      </div>
    </CDialog>
  );
};

export default TallyInProgressReviewDialog;
