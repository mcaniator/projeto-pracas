import { DataFilter } from "@/app/admin/tallys/result/[selectedTallysIds]/dataFilter";
import CDialogTrigger from "@/components/ui/dialog/cDialogTrigger";
import { BooleanPersonProperties } from "@/lib/types/tallys/tallys";
import { IconFilter } from "@tabler/icons-react";

const TallysDataPageFilterDialogTrigger = ({
  setBooleanConditionsFilter,
  booleanConditionsFilter,
}: {
  setBooleanConditionsFilter: React.Dispatch<
    React.SetStateAction<(BooleanPersonProperties | "DEFAULT")[]>
  >;

  booleanConditionsFilter: (BooleanPersonProperties | "DEFAULT")[];
}) => {
  return (
    <CDialogTrigger
      triggerProps={{ square: true }}
      triggerchildren={<IconFilter />}
      title="Filtros"
    >
      <DataFilter
        setBooleanConditionsFilter={setBooleanConditionsFilter}
        booleanConditionsFilter={booleanConditionsFilter}
      />
    </CDialogTrigger>
  );
};

export default TallysDataPageFilterDialogTrigger;
