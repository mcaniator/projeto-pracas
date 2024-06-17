"use client";

import React from "react";

import { TallyDataVisualizationModes } from "./TallysDataPage";
import { MainTallyDataTablePeople } from "./mainTallyDataTablePeople";
import { PersonsDataVisualizationCharts } from "./personsDataVisualizationCharts";

const PersonsDataVisualization = ({
  tallyMap,
  dataVisualizationMode,
}: {
  tallyMap: Map<string, string | number>;
  dataVisualizationMode: TallyDataVisualizationModes;
}) => {
  return (
    <React.Fragment>
      {dataVisualizationMode === "TABLE" && (
        <MainTallyDataTablePeople tallyMap={tallyMap} />
      )}
      {dataVisualizationMode === "CHART" && (
        <PersonsDataVisualizationCharts tallyMap={tallyMap} />
      )}
    </React.Fragment>
  );
};

export { PersonsDataVisualization };
