"use client";

import { TallyDataPersonFilters } from "@/lib/utils/tallyDataVisualization";

import { DataFilter } from "./dataFilter";

type TallysVisualizationActionsCategories = "FILTERS" | "DELETION";

const TallysDataPageActions = ({
  setPersonFilters,
  personFilters,
}: {
  setPersonFilters: React.Dispatch<React.SetStateAction<TallyDataPersonFilters>>;
  personFilters: TallyDataPersonFilters;
}) => {
  return (
    <div className="flex min-h-72 flex-col gap-1 overflow-auto">
      <div className="flex items-center">
        <h4 className="text-2xl font-semibold">Filtros</h4>
      </div>

      <DataFilter
        setPersonFilters={setPersonFilters}
        personFilters={personFilters}
      />
    </div>
  );
};

export { TallysDataPageActions };
export { type TallysVisualizationActionsCategories };
