"use client";

import { Button } from "@/components/button";
import { BooleanPersonProperties } from "@customTypes/tallys/tallys";
import { useState } from "react";

import { DataFilter } from "./dataFilter";
import { DeleteTallySection } from "./deleteTallySection";

type TallysVisualizationActionsCategories = "FILTERS" | "DELETION";
const TallysDataPageActions = ({
  setBooleanConditionsFilter,
  tallyIds,
  booleanConditionsFilter,
}: {
  setBooleanConditionsFilter: React.Dispatch<
    React.SetStateAction<(BooleanPersonProperties | "DEFAULT")[]>
  >;

  tallyIds: number[];
  booleanConditionsFilter: (BooleanPersonProperties | "DEFAULT")[];
}) => {
  const [actionsCategory, setActionsCategory] =
    useState<TallysVisualizationActionsCategories>("FILTERS");
  return (
    <div className="flex min-h-72 flex-col gap-1 overflow-auto">
      <h4 className="text-2xl font-semibold">Ações</h4>
      <div>
        <div className="inline-flex gap-1 rounded-xl bg-gray-400/20 py-1 shadow-inner">
          <Button
            variant={"ghost"}
            className={`rounded-xl px-4 py-1 ${actionsCategory === "FILTERS" ? "bg-gray-200/20 shadow-md" : "bg-gray-400/0 shadow-none"}`}
            onPress={() => setActionsCategory("FILTERS")}
          >
            Filtros
          </Button>
          <Button
            variant={"ghost"}
            className={`rounded-xl px-4 py-1 ${actionsCategory === "DELETION" ? "bg-gray-200/20 shadow-md" : "bg-gray-400/0 shadow-none"}`}
            onPress={() => setActionsCategory("DELETION")}
          >
            Excluir
          </Button>
        </div>
      </div>
      {actionsCategory === "FILTERS" && (
        <DataFilter
          setBooleanConditionsFilter={setBooleanConditionsFilter}
          booleanConditionsFilter={booleanConditionsFilter}
        />
      )}
      {actionsCategory === "DELETION" && (
        <DeleteTallySection tallyIds={tallyIds} />
      )}
    </div>
  );
};

export { TallysDataPageActions };
export { type TallysVisualizationActionsCategories };
