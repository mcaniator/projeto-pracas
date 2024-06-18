"use client";

import React from "react";

import { TallyDataVisualizationModes } from "./TallysDataPage";
import { CommercialActivitiesChart } from "./commercialActivitiesChart";
import { MainTallyDataTableComplementary } from "./mainTallyDataTableComplementary";

interface CommercialActivitiesObject {
  [key: string]: number;
}
interface TallyInfo {
  observer: string;
  startDate: string;
}
interface TallyInfoAndCommercialActivitiesObject {
  tallyInfo: TallyInfo;
  commercialActivities: CommercialActivitiesObject;
}

const ComplementaryDataVisualization = ({
  dataVisualizationMode,
  tallyMap,
  tallyWithCommercialActivities,
}: {
  dataVisualizationMode: TallyDataVisualizationModes;
  tallyMap: Map<string, string | number>;
  tallyWithCommercialActivities: Map<
    number,
    TallyInfoAndCommercialActivitiesObject
  >;
}) => {
  return (
    <div className="flex flex-col gap-1 overflow-auto rounded">
      <div className="flex flex-row gap-1">
        <table>
          <thead>
            <tr>
              <th style={{ border: "1px solid white", padding: "0.5rem" }}>
                Pets
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td
                style={{
                  border: "1px solid white",
                  padding: "0.5rem",
                  textAlign: "center",
                }}
              >
                {tallyMap.get("Pets")}
              </td>
            </tr>
          </tbody>
        </table>
        <table>
          <thead>
            <tr>
              <th style={{ border: "1px solid white", padding: "0.5rem" }}>
                Grupos com 2 ou mais pessoas
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td
                style={{
                  border: "1px solid white",
                  padding: "0.5rem",
                  textAlign: "center",
                }}
              >
                {tallyMap.get("Groups")}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      {dataVisualizationMode === "TABLE" && (
        <MainTallyDataTableComplementary
          tallyMap={tallyMap}
          tallyWithCommercialActivities={tallyWithCommercialActivities}
        />
      )}
      {dataVisualizationMode === "CHART" && (
        <CommercialActivitiesChart
          tallyWithCommercialActivities={tallyWithCommercialActivities}
        />
      )}
    </div>
  );
};

export { ComplementaryDataVisualization };
export { type TallyInfoAndCommercialActivitiesObject };
