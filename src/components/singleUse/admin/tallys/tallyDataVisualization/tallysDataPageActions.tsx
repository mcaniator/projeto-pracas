"use client";

import { Button } from "@/components/button";
import { personType } from "@/lib/zodValidators";
import { useState } from "react";

import { DataTypesInTallyVisualization } from "./TallysDataPage";
import { DataFilter } from "./dataFilter";
import { DeleteTallySection } from "./deleteTallySection";

type TallysVisualizationActionsCategories = "FILTERS" | "DELETION";
const TallysDataPageActions = ({
  setBooleanConditionsFilter,
  setDataTypeToShow,
  dataTypeToShow,
  tallyIds,
}: {
  setBooleanConditionsFilter: React.Dispatch<
    React.SetStateAction<(keyof personType)[]>
  >;
  setDataTypeToShow: React.Dispatch<
    React.SetStateAction<DataTypesInTallyVisualization>
  >;
  dataTypeToShow: DataTypesInTallyVisualization;
  tallyIds: number[];
}) => {
  const [actionsCategory, setActionsCategory] =
    useState<TallysVisualizationActionsCategories>("FILTERS");
  return (
    <div className="flex flex-col gap-1  rounded-3xl bg-gray-300/30 p-3 text-white shadow-md">
      <h4 className="text-2xl font-semibold">Ações</h4>
      <div>
        <div className="inline-flex gap-1 rounded-xl bg-gray-400/20 py-1 text-white shadow-inner">
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
          setDataTypeToShow={setDataTypeToShow}
          dataTypeToShow={dataTypeToShow}
        />
      )}
      {actionsCategory === "DELETION" && (
        <DeleteTallySection tallyIds={tallyIds} />
      )}
    </div>
  );
};

export { TallysDataPageActions };
