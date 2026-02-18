import { TallyInProgressDatabaseOptions } from "@/app/admin/tallys/[tallyId]/fill/tallyInProgressDatabaseOptions";
import { SubmittingObj } from "@/app/admin/tallys/[tallyId]/fill/tallyInProgressPage";
import CDialog from "@/components/ui/dialog/cDialog";
import { WeatherStats } from "@/lib/types/tallys/ongoingTally";
import { CommercialActivity } from "@/lib/zodValidators";
import { Dayjs } from "dayjs";

const TallyInProgressSaveDialog = ({
  open,
  onClose,
  submittingObj,
  tallyId,
  locationId,
  locationName,
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
  open: boolean;
  onClose: () => void;
  submittingObj: {
    submitting: boolean;
    finishing: boolean;
    deleting: boolean;
  };
  tallyId: number;
  locationId: number;
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
  setStartDate: React.Dispatch<React.SetStateAction<Dayjs>>;
  setEndDate: React.Dispatch<React.SetStateAction<Dayjs | null>>;
  setSubmittingObj: React.Dispatch<React.SetStateAction<SubmittingObj>>;
}) => {
  return (
    <CDialog open={open} onClose={onClose} fullScreen title="Salvar">
      <div className="flex flex-col gap-2">
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
      </div>
    </CDialog>
  );
};

export default TallyInProgressSaveDialog;
