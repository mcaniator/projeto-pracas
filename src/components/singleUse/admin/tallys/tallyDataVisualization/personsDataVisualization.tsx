"use client";

import React from "react";

import { TallyDataVisualizationModes } from "./TallysDataPage";
import { PersonsDataVisualizationCharts } from "./personsDataVisualizationCharts";
import { PersonsDatavisualizationTables } from "./personsDataVisualizationTables";

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
        <PersonsDatavisualizationTables tallyMap={tallyMap} />
      )}
      {dataVisualizationMode === "CHART" && (
        <PersonsDataVisualizationCharts tallyMap={tallyMap} />
      )}
    </React.Fragment>
  );
};

export { PersonsDataVisualization };
