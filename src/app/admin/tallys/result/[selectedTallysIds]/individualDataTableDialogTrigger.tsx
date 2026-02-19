import { IndividualDataTable } from "@/app/admin/tallys/result/[selectedTallysIds]/individualDataTable";
import CDialogTrigger from "@/components/ui/dialog/cDialogTrigger";
import { FinalizedTally } from "@/lib/zodValidators";
import { IconChecklist } from "@tabler/icons-react";

const IndividualDataTableDialogTrigger = ({
  tallys,
}: {
  tallys: FinalizedTally[];
}) => {
  return (
    <CDialogTrigger
      title="Dados das contagens"
      triggerProps={{ square: true }}
      triggerchildren={<IconChecklist />}
    >
      <IndividualDataTable tallys={tallys} />
    </CDialogTrigger>
  );
};

export default IndividualDataTableDialogTrigger;
