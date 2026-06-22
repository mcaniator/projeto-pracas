import TallyInProgressReview from "@/app/admin/tallys/[tallyId]/fill/tallyInProgressReview";
import CDialog from "@/components/ui/dialog/cDialog";
import { WeatherStats } from "@/lib/types/tallys/ongoingTally";
import { OngoingTally } from "@/lib/zodValidators";

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
  return (
    <CDialog open={open} onClose={onClose} fullScreen title="Acompanhamento">
      <TallyInProgressReview
        tally={tally}
        weatherStats={weatherStats}
        complementaryData={complementaryData}
        commercialActivities={commercialActivities}
        tallyMap={tallyMap}
        isInDialog
      />
    </CDialog>
  );
};

export default TallyInProgressReviewDialog;
