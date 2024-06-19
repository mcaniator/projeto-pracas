"use client";

import React from "react";

import { TallyDataVisualizationModes } from "./TallysDataPage";
import { CommercialActivitiesChart } from "./commercialActivitiesChart";
import { CommercialActivitiesTable } from "./commercialActivitiesTable";

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
  const commercialActivitiesNames: string[] = [];
  let totalCommercialActivities = 0;
  const commercialActivitiesWithTotalOccurrences = new Map<string, number>();
  tallyWithCommercialActivities.forEach((tally) => {
    if (
      tally.commercialActivities &&
      Object.keys(tally.commercialActivities).length > 0
    ) {
      Object.entries(tally.commercialActivities).forEach(([key, value]) => {
        if (value) {
          const previousValue =
            commercialActivitiesWithTotalOccurrences.get(key) || 0;
          commercialActivitiesWithTotalOccurrences.set(
            key,
            previousValue + value,
          );
          totalCommercialActivities += value;
          if (value !== 0 && !commercialActivitiesNames.includes(key)) {
            commercialActivitiesNames.push(key);
          }
        }
      });
    }
  });
  commercialActivitiesNames.sort();
  const commercialActivitiesArray = Array.from(
    commercialActivitiesWithTotalOccurrences,
  );
  commercialActivitiesArray.sort((a, b) => a[0].localeCompare(b[0]));
  const sorrtedOccurrences = commercialActivitiesArray.map(
    (activity) => activity[1],
  );
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
        <CommercialActivitiesTable
          tallyWithCommercialActivities={tallyWithCommercialActivities}
          sortedCommercialActivitiesNames={commercialActivitiesNames}
          totalCommercialActivities={totalCommercialActivities}
          sortedOccurrences={sorrtedOccurrences}
        />
      )}
      {dataVisualizationMode === "CHART" && (
        <CommercialActivitiesChart
          sortedCommercialActivitiesNames={commercialActivitiesNames}
          sortedOccurrences={sorrtedOccurrences}
        />
      )}
    </div>
  );
};

export { ComplementaryDataVisualization };
export { type TallyInfoAndCommercialActivitiesObject };
