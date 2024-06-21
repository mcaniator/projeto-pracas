"use client";

import { Button } from "@/components/button";
import { personType } from "@/lib/zodValidators";
import { Gender } from "@prisma/client";
import { AgeGroup } from "@prisma/client";
import { Activity } from "@prisma/client";
import { WeatherConditions } from "@prisma/client";
import { JsonValue } from "@prisma/client/runtime/library";
import { useEffect, useState } from "react";
import React from "react";
import { z } from "zod";

import { ComplementaryDataVisualization } from "./complementaryDataVisualization";
import { IndividualDataTable } from "./individualDataTable";
import { PersonsDataVisualization } from "./personsDataVisualization";
import { TallysDataPageActions } from "./tallysDataPageActions";

interface TallyDataFetched {
  tallyPerson: TallyPerson[];
  id: number;
  startDate: Date;
  endDate: Date | null;
  observer: string;
  animalsAmount: number | null;
  groups: number | null;
  temperature: number | null;
  weatherCondition: WeatherConditions | null;
  commercialActivities: JsonValue;
}
type DataTypesInTallyVisualization = "PERSONS_DATA" | "COMPLEMENTARY_DATA";
type TallyDataVisualizationModes = "CHART" | "TABLE";
type BooleanPersonProperties =
  | "isPersonWithImpairment"
  | "isTraversing"
  | "isInApparentIllicitActivity"
  | "isPersonWithoutHousing"
  | "noBooleanCharacteristic";

const booleanPersonProperties: BooleanPersonProperties[] = [
  "isPersonWithImpairment",
  "isTraversing",
  "isInApparentIllicitActivity",
  "isPersonWithoutHousing",
  "noBooleanCharacteristic",
];

const imutableTallyData = (tallys: TallyDataFetched[]) => {
  const commercialActivitiesMap = new Map();
  const tallyMap = new Map();
  tallyMap.set("Groups", 0);
  tallyMap.set("Pets", 0);
  tallyMap.set("totalCommercialActivities", 0);

  for (const tally of tallys) {
    commercialActivitiesMap.set(tally.id, {
      tallyInfo: {
        observer: tally.observer,
        startDate: tally.startDate.toLocaleString(),
      },
      commercialActivities: tally.commercialActivities,
    });
    if (tally.animalsAmount) {
      tallyMap.set("Pets", tallyMap.get("Pets") + tally.animalsAmount);
    }
  }
  return {
    tallyMap: tallyMap,
    commercialActivitiesMap: commercialActivitiesMap,
  };
};
const processTallyData = (
  tallys: TallyDataFetched[],
  booleanConditionsFilter: (keyof personType)[],
) => {
  const tallyMap = new Map();
  for (const gender of Object.keys(Gender)) {
    for (const ageGroup of Object.keys(AgeGroup)) {
      for (const activity of Object.keys(Activity)) {
        tallyMap.set(`${gender}-${ageGroup}-${activity}`, 0);
      }
      tallyMap.set(`Tot-${gender}-${ageGroup}`, 0);
    }
    tallyMap.set(`Tot-${gender}`, 0);
    for (const property of booleanPersonProperties) {
      tallyMap.set(`${gender}-${property}`, 0);
      tallyMap.set(`%${gender}-${property}`, "0.00%");
    }
  }
  for (const ageGroup of Object.keys(AgeGroup)) {
    tallyMap.set(`Tot-${ageGroup}`, 0);
  }
  for (const activity of Object.keys(Activity)) {
    tallyMap.set(`Tot-${activity}`, 0);
  }
  tallyMap.set("Tot-H&M", 0);
  tallyMap.set("%MALE", "0.00%");
  tallyMap.set("%FEMALE", "0.00%");
  for (const ageGroup of Object.keys(AgeGroup)) {
    tallyMap.set(`%${ageGroup}`, "0.00%");
  }
  for (const activity of Object.keys(Activity)) {
    tallyMap.set(`%${activity}`, "0.00%");
  }

  tallyMap.set("Groups", 0);

  for (const tally of tallys) {
    if (tally.groups) {
      tallyMap.set("Groups", tallyMap.get("Groups") + tally.groups);
    }

    for (const tallyPerson of tally.tallyPerson) {
      let skipToNextPerson = false;
      if (booleanConditionsFilter.length > 0) {
        for (const filter of booleanConditionsFilter) {
          if (tallyPerson.person[filter] === false) {
            skipToNextPerson = true;
            break;
          }
        }
      }
      if (skipToNextPerson) {
        continue;
      }
      const key = `${tallyPerson.person.gender}-${tallyPerson.person.ageGroup}-${tallyPerson.person.activity}`;
      tallyMap.set(key, tallyMap.get(key) + tallyPerson.quantity);
      tallyMap.set(
        `Tot-${tallyPerson.person.gender}-${tallyPerson.person.ageGroup}`,
        tallyMap.get(
          `Tot-${tallyPerson.person.gender}-${tallyPerson.person.ageGroup}`,
        ) + tallyPerson.quantity,
      );
      tallyMap.set(
        `Tot-${tallyPerson.person.gender}`,
        tallyMap.get(`Tot-${tallyPerson.person.gender}`) + tallyPerson.quantity,
      );
      tallyMap.set("Tot-H&M", tallyMap.get("Tot-H&M") + tallyPerson.quantity);
      for (const gender of Array.from(Object.keys(Gender))) {
        booleanPersonProperties.map((property) => {
          if (property !== "noBooleanCharacteristic") {
            if (
              tallyPerson.person.gender === gender &&
              tallyPerson.person[property]
            ) {
              tallyMap.set(
                `${gender}-${property}`,
                tallyMap.get(`${gender}-${property}`) + tallyPerson.quantity,
              );
            }
          }
        });
      }

      if (
        !tallyPerson.person.isInApparentIllicitActivity &&
        !tallyPerson.person.isPersonWithImpairment &&
        !tallyPerson.person.isPersonWithoutHousing &&
        !tallyPerson.person.isTraversing
      ) {
        tallyMap.set(
          "noBooleanCharacteristic",
          tallyMap.get("noBooleanCharacteristic") + tallyPerson.quantity,
        );
      }
    }
  }
  //Calculating data
  let totalPeople = 0;
  totalPeople = z.number().parse(tallyMap.get("Tot-H&M"));
  if (totalPeople != 0) {
    for (const gender of Object.keys(Gender)) {
      tallyMap.set(
        `%${gender}`,
        ((tallyMap.get(`Tot-${gender}`) / totalPeople) * 100).toFixed(2) + "%",
      );
    }
    for (const ageGroup of Object.keys(AgeGroup)) {
      let totalAgeGroup = 0;
      for (const gender of Object.keys(Gender)) {
        for (const activity of Object.keys(Activity)) {
          totalAgeGroup += tallyMap.get(`${gender}-${ageGroup}-${activity}`);
        }
      }
      tallyMap.set(`Tot-${ageGroup}`, totalAgeGroup);
      tallyMap.set(
        `%${ageGroup}`,
        ((totalAgeGroup / totalPeople) * 100).toFixed(2) + "%",
      );
    }
    for (const activity of Object.keys(Activity)) {
      let activityTotal = 0;
      for (const gender of Object.keys(Gender)) {
        for (const ageGroup of Object.keys(AgeGroup)) {
          activityTotal += tallyMap.get(`${gender}-${ageGroup}-${activity}`);
        }
      }
      tallyMap.set(`Tot-${activity}`, activityTotal);
      tallyMap.set(
        `%${activity}`,
        ((activityTotal / tallyMap.get(`Tot-H&M`)) * 100).toFixed(2) + "%",
      );
    }
    for (const property of booleanPersonProperties) {
      let propertyTotal = 0;
      for (const gender of Object.keys(Gender)) {
        propertyTotal += tallyMap.get(`${gender}-${property}`);
      }
      tallyMap.set(
        `%${property}`,
        ((propertyTotal / totalPeople) * 100).toFixed(2) + "%",
      );
    }
  }
  return tallyMap;
};

interface TallyPerson {
  person: {
    gender: Gender;
    ageGroup: AgeGroup;
    activity: Activity;
    isTraversing: boolean;
    isPersonWithImpairment: boolean;
    isInApparentIllicitActivity: boolean;
    isPersonWithoutHousing: boolean;
  };
  quantity: number;
}

const TallysDataPage = ({
  locationName,
  tallys,
  tallysIds,
}: {
  locationName: string;
  tallys: TallyDataFetched[];
  tallysIds: number[];
}) => {
  const [dataVisualizationMode, setDataVisualizationMode] =
    useState<TallyDataVisualizationModes>("TABLE");
  const [booleanConditionsFilter, setBooleanConditionsFilter] = useState<
    (keyof personType)[]
  >([]);
  const [tallyMap, setTallyMap] = useState<Map<string, string | number>>(
    new Map(),
  );
  const [dataTypeToShow, setDataTypeToShow] =
    useState<DataTypesInTallyVisualization>("PERSONS_DATA");
  useEffect(() => {
    setTallyMap(processTallyData(tallys, booleanConditionsFilter));
  }, [booleanConditionsFilter, tallys]);
  const imutableTallyMaps = imutableTallyData(tallys);
  return (
    <div className="flex max-h-full min-h-0 w-fit gap-5 p-5">
      <div className="flex flex-col gap-1 rounded-3xl bg-gray-300/30 p-3 text-white shadow-md">
        <h3 className="text-2xl font-semibold">{`Contagens realizadas em ${locationName}`}</h3>
        <div className="flex flex-row gap-5 overflow-auto">
          <div
            className="flex flex-col overflow-auto"
            style={{ width: "50.7854375rem" }}
          >
            <div>
              <div className="inline-flex gap-1 rounded-xl bg-gray-400/20 py-1 text-white shadow-inner">
                <Button
                  variant={"ghost"}
                  className={`rounded-xl px-4 py-1 ${dataVisualizationMode === "TABLE" ? "bg-gray-200/20 shadow-md" : "bg-gray-400/0 shadow-none"}`}
                  onPress={() => setDataVisualizationMode("TABLE")}
                >
                  Tabelas
                </Button>
                <Button
                  variant={"ghost"}
                  className={`rounded-xl px-4 py-1 ${dataVisualizationMode === "CHART" ? "bg-gray-200/20 shadow-md" : "bg-gray-400/0 shadow-none"}`}
                  onPress={() => setDataVisualizationMode("CHART")}
                >
                  Gráficos
                </Button>
              </div>
            </div>
            {dataTypeToShow === "PERSONS_DATA" ?
              <PersonsDataVisualization
                dataVisualizationMode={dataVisualizationMode}
                tallyMap={tallyMap}
              />
            : <ComplementaryDataVisualization
                dataVisualizationMode={dataVisualizationMode}
                tallyWithCommercialActivities={
                  imutableTallyMaps.commercialActivitiesMap
                }
                tallyMap={imutableTallyMaps.tallyMap}
              />
            }
          </div>
          <div className="flex h-fit flex-col gap-1 overflow-auto rounded-xl bg-gray-400/20 p-2 text-white shadow-inner">
            <div className="flex flex-col gap-5 overflow-auto">
              <TallysDataPageActions
                setBooleanConditionsFilter={setBooleanConditionsFilter}
                setDataTypeToShow={setDataTypeToShow}
                dataTypeToShow={dataTypeToShow}
                tallyIds={tallysIds}
              />

              <IndividualDataTable tallys={tallys} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export { TallysDataPage };
export { type DataTypesInTallyVisualization, type TallyDataVisualizationModes };
