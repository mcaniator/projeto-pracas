"use client";

import { TallyInfoAndCommercialActivitiesObject } from "@/lib/types/tallys/tallyDataVisualization";
import { Activity, AgeGroup, Gender } from "@enums/personCharacteristics";
import React from "react";

import { TallyDataVisualizationModes } from "./TallysDataPage";
import { PersonsDataVisualizationCharts } from "./personsDataVisualizationCharts";
import {
  PersonsDatavisualizationTables,
  TallyComplementaryData,
} from "./personsDataVisualizationTables";

interface TallyDataArraysByGender {
  MALE: number[];
  FEMALE: number[];
}

const booleanCharacteristicsInOrder = [
  "noBooleanCharacteristic",
  "isTraversing",
  "isPersonWithImpairment",
  "isInApparentIllicitActivity",
  "isPersonWithoutHousing",
];

const calculateActivityArrays = (tallyMap: Map<string, string | number>) => {
  const activityArrays: TallyDataArraysByGender = { MALE: [], FEMALE: [] };
  for (const gender of Object.keys(Gender)) {
    const activityArray: number[] = [];
    for (const activity of Object.values(Activity)) {
      let count = 0;
      tallyMap.forEach((value, key) => {
        const [keyGender, , keyActivity] = key.split("-");
        if (keyGender === gender && keyActivity === activity) {
          if (typeof value === "number") count += value;
        }
      });
      activityArray.push(count);
    }
    activityArrays[gender as keyof TallyDataArraysByGender] = activityArray;
  }
  return activityArrays;
};
const calculateAgeGroupArrays = (tallyMap: Map<string, string | number>) => {
  const ageGroupArrays: TallyDataArraysByGender = { MALE: [], FEMALE: [] };
  for (const gender of Object.keys(Gender)) {
    const ageGroupArray: number[] = [];
    for (const ageGroup of Object.values(AgeGroup)) {
      let count = 0;
      tallyMap.forEach((value, key) => {
        const [keyGender, keyAgeGroup] = key.split("-");
        if (keyGender === gender && keyAgeGroup === ageGroup) {
          if (typeof value === "number") count += value;
        }
      });
      ageGroupArray.push(count);
    }
    ageGroupArrays[gender as keyof TallyDataArraysByGender] = ageGroupArray;
  }
  return ageGroupArrays;
};

const calculateBooleanCharacteristicsArrays = (
  tallyMap: Map<string, string | number>,
) => {
  const booleanCharacteristicsArrays: TallyDataArraysByGender = {
    MALE: [],
    FEMALE: [],
  };
  for (const gender of Object.keys(Gender)) {
    const booleanCharacteristicsArray: number[] = [0, 0, 0, 0, 0];
    booleanCharacteristicsInOrder.forEach((characteristic, index) => {
      tallyMap.forEach((value, key) => {
        const [keyGender, booleanCharacteristic] = key.split("-");
        if (
          booleanCharacteristic &&
          characteristic === booleanCharacteristic &&
          gender === keyGender
        ) {
          if (typeof value === "number") {
            booleanCharacteristicsArray[index] = value;
          }
        }
      });
    });
    booleanCharacteristicsArrays[gender as keyof TallyDataArraysByGender] =
      booleanCharacteristicsArray;
  }
  return booleanCharacteristicsArrays;
};

const PersonsDataVisualization = ({
  tallyMap,
  complementaryData,
  dataVisualizationMode,
  tallyWithCommercialActivities,
}: {
  tallyMap: Map<string, number>;
  complementaryData: TallyComplementaryData;
  dataVisualizationMode: TallyDataVisualizationModes;
  tallyWithCommercialActivities: Map<
    number,
    TallyInfoAndCommercialActivitiesObject
  >;
}) => {
  const activityArrays = calculateActivityArrays(tallyMap);
  const ageGroupArrays = calculateAgeGroupArrays(tallyMap);
  const booleanCharacteristicsArrays =
    calculateBooleanCharacteristicsArrays(tallyMap);
  return (
    <React.Fragment>
      {dataVisualizationMode === "TABLE" && (
        <PersonsDatavisualizationTables
          tallyMap={tallyMap}
          tallyComplementaryData={complementaryData}
          tallyWithCommercialActivities={tallyWithCommercialActivities}
        />
      )}
      {dataVisualizationMode === "CHART" && (
        <PersonsDataVisualizationCharts
          activityArrays={activityArrays}
          ageGroupArrays={ageGroupArrays}
          booleanCharacteristicsArrays={booleanCharacteristicsArrays}
        />
      )}
    </React.Fragment>
  );
};

export { PersonsDataVisualization };
export { type TallyDataArraysByGender };
