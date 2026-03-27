import { DataFilter } from "@/components/tallyDataVisualization/dataFilter";
import CDialogTrigger from "@/components/ui/dialog/cDialogTrigger";
import { TallyDataPersonFilters } from "@/lib/utils/tallyDataVisualization";
import { IconFilter } from "@tabler/icons-react";

const TallysDataPageFilterDialogTrigger = ({
  setPersonFilters,
  personFilters,
}: {
  setPersonFilters: React.Dispatch<React.SetStateAction<TallyDataPersonFilters>>;
  personFilters: TallyDataPersonFilters;
}) => {
  return (
    <CDialogTrigger
      triggerProps={{ square: true }}
      triggerchildren={<IconFilter />}
      title="Filtros"
    >
      <DataFilter
        setPersonFilters={setPersonFilters}
        personFilters={personFilters}
      />
    </CDialogTrigger>
  );
};

export default TallysDataPageFilterDialogTrigger;

