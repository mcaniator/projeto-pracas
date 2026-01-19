import { TallyInProgressDatabaseOptions } from "@/app/admin/tallys/[tallyId]/fill/tallyInProgressDatabaseOptions";
import { SubmittingObj } from "@/app/admin/tallys/[tallyId]/fill/tallyInProgressPage";
import CDialog from "@/components/ui/dialog/cDialog";
import { WeatherStats } from "@/lib/types/tallys/ongoingTally";
import { CommercialActivity } from "@/lib/zodValidators";

const TallyInProgressSaveDialog = ({
  open,
  onClose,
  submittingObj,
  tallyId,
  locationId,
  weatherStats,
  complementaryData,
  commercialActivities,
  tallyMap,
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
  weatherStats: WeatherStats;
  complementaryData: {
    animalsAmount: number;
    groupsAmount: number;
  };
  commercialActivities: CommercialActivity;
  tallyMap: Map<string, number>;
  setSubmittingObj: React.Dispatch<React.SetStateAction<SubmittingObj>>;
}) => {
  return (
    <CDialog open={open} onClose={onClose} fullScreen title="Salvar">
      <div className="flex flex-col gap-2">
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
      </div>
    </CDialog>
  );
};

export default TallyInProgressSaveDialog;
