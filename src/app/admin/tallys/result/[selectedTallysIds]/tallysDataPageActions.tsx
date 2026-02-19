"use client";

import CIconChip from "@/components/ui/cIconChip";
import { BooleanPersonProperties } from "@customTypes/tallys/tallys";
import { IconHelp } from "@tabler/icons-react";

import { DataFilter } from "./dataFilter";

type TallysVisualizationActionsCategories = "FILTERS" | "DELETION";

const TallysDataPageActions = ({
  setBooleanConditionsFilter,
  booleanConditionsFilter,
}: {
  setBooleanConditionsFilter: React.Dispatch<
    React.SetStateAction<(BooleanPersonProperties | "DEFAULT")[]>
  >;

  booleanConditionsFilter: (BooleanPersonProperties | "DEFAULT")[];
}) => {
  return (
    <div className="flex min-h-72 flex-col gap-1 overflow-auto">
      <div className="flex items-center justify-between">
        <h4 className="text-2xl font-semibold">Filtros</h4>
        <CIconChip
          icon={<IconHelp />}
          tooltip="Filtros acumulativos. Se mais de um for selecionado, apenas pessoas que se encaixam em todas as características selecionadas serão mostradas. Se 'Nenhuma característica binária específica' for selecionada, apenas pessoas que não se encaixam em nenhuma das outras características serão mostradas."
        />
      </div>

      <DataFilter
        setBooleanConditionsFilter={setBooleanConditionsFilter}
        booleanConditionsFilter={booleanConditionsFilter}
      />
    </div>
  );
};

export { TallysDataPageActions };
export { type TallysVisualizationActionsCategories };
