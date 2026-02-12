"use client";

import { TallyComplementaryData } from "@/app/admin/tallys/result/[selectedTallysIds]/personsDataVisualizationTables";
import { Button } from "@/components/button";
import CAdminHeader from "@/components/ui/cAdminHeader";
import { BooleanPersonProperties } from "@customTypes/tallys/tallys";
import { Activity, AgeGroup, Gender } from "@enums/personCharacteristics";
import { Divider, Paper } from "@mui/material";
import { FinalizedTally } from "@zodValidators";
import { useEffect, useState } from "react";
import React from "react";
import { GrGroup } from "react-icons/gr";
import { z } from "zod";

import { ComplementaryDataVisualization } from "./complementaryDataVisualization";
import { IndividualDataTable } from "./individualDataTable";
import IndividualDataTableModal from "./individualDataTableModal";
import { PersonsDataVisualization } from "./personsDataVisualization";
import TallyDeletionModal from "./tallyDeletionModal";
import { TallysDataPageActions } from "./tallysDataPageActions";
import TallysDataPageFilterModal from "./tallysDataPageFilterModal";

type DataTypesInTallyVisualization = "PERSONS_DATA" | "COMPLEMENTARY_DATA";
type TallyDataVisualizationModes = "CHART" | "TABLE";

const booleanPersonProperties: BooleanPersonProperties[] = [
  "isPersonWithImpairment",
  "isTraversing",
  "isInApparentIllicitActivity",
  "isPersonWithoutHousing",
];
type BooleanPersonPropertiesWithNoBooleanCharacteristic =
  | "isPersonWithImpairment"
  | "isTraversing"
  | "isInApparentIllicitActivity"
  | "isPersonWithoutHousing"
  | "noBooleanCharacteristic";

const booleanPersonPropertiesWithNoBooleanCharacteristic: BooleanPersonPropertiesWithNoBooleanCharacteristic[] =
  [
    "isPersonWithImpairment",
    "isTraversing",
    "isInApparentIllicitActivity",
    "isPersonWithoutHousing",
    "noBooleanCharacteristic",
  ];

const immutableTallyData = (tallys: FinalizedTally[]) => {
  const commercialActivitiesMap = new Map();
  const tallyMap = new Map();
  tallyMap.set("Groups", 0);
  tallyMap.set("Pets", 0);
  tallyMap.set("totalCommercialActivities", 0);

  for (const tally of tallys) {
    commercialActivitiesMap.set(tally.id, {
      tallyInfo: {
        observer: tally.user.username,
        startDate: tally.startDate.toLocaleString(),
      },
      commercialActivities: tally.commercialActivities,
    });
    if (tally.animalsAmount) {
      tallyMap.set("Pets", tallyMap.get("Pets") + tally.animalsAmount);
    }
    if (tally.groups) {
      tallyMap.set("Groups", tallyMap.get("Groups") + tally.groups);
    }
  }
  return {
    tallyMap: tallyMap,
    commercialActivitiesMap: commercialActivitiesMap,
  };
};
const processTallyData = (
  tallys: FinalizedTally[],
  booleanConditionsFilter: (BooleanPersonProperties | "DEFAULT")[],
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
    for (const property of booleanPersonPropertiesWithNoBooleanCharacteristic) {
      tallyMap.set(`${gender}-${property}`, 0);
      tallyMap.set(`%${gender}-${property}`, 0);
    }
  }
  for (const ageGroup of Object.keys(AgeGroup)) {
    tallyMap.set(`Tot-${ageGroup}`, 0);
  }
  for (const activity of Object.keys(Activity)) {
    tallyMap.set(`Tot-${activity}`, 0);
  }
  tallyMap.set("Tot-H&M", 0);
  tallyMap.set("%MALE", 0);
  tallyMap.set("%FEMALE", 0);
  for (const ageGroup of Object.keys(AgeGroup)) {
    tallyMap.set(`%${ageGroup}`, 0);
  }
  for (const activity of Object.keys(Activity)) {
    tallyMap.set(`%${activity}`, 0);
  }
  for (const booleanCharacteristic of booleanPersonPropertiesWithNoBooleanCharacteristic) {
    tallyMap.set(`%${booleanCharacteristic}`, 0);
  }
  for (const tally of tallys) {
    if (!tally.tallyPerson) continue;
    for (const tallyPerson of tally.tallyPerson) {
      let skipToNextPerson = false;
      if (booleanConditionsFilter.length > 0) {
        for (const filter of booleanConditionsFilter) {
          if (filter === "DEFAULT") {
            for (const property of booleanPersonProperties) {
              if (tallyPerson.person[property] === true) {
                skipToNextPerson = true;
                break;
              }
            }
          } else if (tallyPerson.person[filter] === false) {
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
        booleanPersonPropertiesWithNoBooleanCharacteristic.map((property) => {
          if (property !== "noBooleanCharacteristic") {
            if (
              tallyPerson.person.gender === (gender as Gender) &&
              tallyPerson.person[property]
            ) {
              tallyMap.set(
                `${gender}-${property}`,
                tallyMap.get(`${gender}-${property}`) + tallyPerson.quantity,
              );
            }
          } else {
            if (
              !tallyPerson.person.isInApparentIllicitActivity &&
              !tallyPerson.person.isPersonWithImpairment &&
              !tallyPerson.person.isPersonWithoutHousing &&
              !tallyPerson.person.isTraversing &&
              tallyPerson.person.gender === (gender as Gender)
            ) {
              tallyMap.set(
                `${gender}-noBooleanCharacteristic`,
                tallyMap.get(`${gender}-noBooleanCharacteristic`) +
                  tallyPerson.quantity,
              );
            }
          }
        });
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
        (tallyMap.get(`Tot-${gender}`) / totalPeople) * 100,
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
      tallyMap.set(`%${ageGroup}`, (totalAgeGroup / totalPeople) * 100);
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
        (activityTotal / tallyMap.get(`Tot-H&M`)) * 100,
      );
    }
    for (const property of booleanPersonPropertiesWithNoBooleanCharacteristic) {
      let propertyTotal = 0;
      for (const gender of Object.keys(Gender)) {
        propertyTotal += tallyMap.get(`${gender}-${property}`);
      }
      tallyMap.set(`%${property}`, (propertyTotal / totalPeople) * 100);
    }
  }
  return tallyMap;
};

const TallysDataPage = ({
  tallys,
  tallysIds,
  complementaryData,
  locationName,
}: {
  tallys: FinalizedTally[];
  tallysIds: number[];
  complementaryData: TallyComplementaryData;
  locationName: string;
}) => {
  const [dataVisualizationMode, setDataVisualizationMode] =
    useState<TallyDataVisualizationModes>("TABLE");
  const [booleanConditionsFilter, setBooleanConditionsFilter] = useState<
    (BooleanPersonProperties | "DEFAULT")[]
  >([]);
  const [tallyMap, setTallyMap] = useState<Map<string, number>>(new Map());
  const [dataTypeToShow, setDataTypeToShow] =
    useState<DataTypesInTallyVisualization>("PERSONS_DATA");
  useEffect(() => {
    setTallyMap(processTallyData(tallys, booleanConditionsFilter));
  }, [booleanConditionsFilter, tallys]);
  const immutableTallyMaps = immutableTallyData(tallys);
  return (
    <div className="flex max-h-full min-h-0 max-w-full gap-5 text-black">
      <div className="flex w-full flex-col gap-1 overflow-auto bg-white p-3 shadow-md">
        <CAdminHeader
          titleIcon={<GrGroup size={25} />}
          title={`Resultado de ${tallys.length > 1 ? ` (${tallys.length} contagens)` : "contagem"} em ${locationName}`}
        />
        <div className="flex w-full flex-row gap-5 overflow-auto">
          <div
            className={
              dataVisualizationMode === "CHART" ?
                "flex w-full flex-col overflow-auto xl:basis-3/5"
              : "flex w-full flex-col gap-1 overflow-auto"
            }
          >
            <div className="flex flex-wrap gap-x-5 gap-y-2">
              <div className="inline-flex gap-1 rounded-xl bg-gray-400/20 py-1 shadow-inner">
                <Button
                  variant={"ghost"}
                  className={`rounded-xl px-4 py-1 text-sm xl:text-base ${dataVisualizationMode === "TABLE" ? "bg-gray-200/20 shadow-md" : "bg-gray-400/0 shadow-none"}`}
                  onPress={() => setDataVisualizationMode("TABLE")}
                >
                  Tabelas
                </Button>
                <Button
                  variant={"ghost"}
                  className={`rounded-xl px-4 py-1 text-sm xl:text-base ${dataVisualizationMode === "CHART" ? "bg-gray-200/20 shadow-md" : "bg-gray-400/0 shadow-none"}`}
                  onPress={() => setDataVisualizationMode("CHART")}
                >
                  Gráficos
                </Button>
              </div>
              <div className="inline-flex w-fit gap-1 rounded-xl bg-gray-400/20 py-1 shadow-inner">
                <Button
                  variant={"ghost"}
                  className={`rounded-xl px-4 py-1 text-sm xl:text-base ${dataTypeToShow === "PERSONS_DATA" ? "bg-gray-200/20 shadow-md" : "bg-gray-400/0 shadow-none"}`}
                  onPress={() => setDataTypeToShow("PERSONS_DATA")}
                >
                  Pessoas
                </Button>
                <Button
                  variant={"ghost"}
                  className={`rounded-xl px-4 py-1 text-sm xl:text-base ${dataTypeToShow === "COMPLEMENTARY_DATA" ? "bg-gray-200/20 shadow-md" : "bg-gray-400/0 shadow-none"}`}
                  onPress={() => setDataTypeToShow("COMPLEMENTARY_DATA")}
                >
                  Dados extras
                </Button>
              </div>
              <div className="ml-auto flex gap-1 xl:hidden">
                <TallysDataPageFilterModal
                  setBooleanConditionsFilter={setBooleanConditionsFilter}
                  booleanConditionsFilter={booleanConditionsFilter}
                />
                <IndividualDataTableModal tallys={tallys} />
                <TallyDeletionModal tallyIds={tallysIds} />
              </div>
            </div>

            {dataTypeToShow === "PERSONS_DATA" ?
              <PersonsDataVisualization
                dataVisualizationMode={dataVisualizationMode}
                complementaryData={complementaryData}
                tallyMap={tallyMap}
                tallyWithCommercialActivities={
                  immutableTallyMaps.commercialActivitiesMap
                }
              />
            : <ComplementaryDataVisualization
                dataVisualizationMode={dataVisualizationMode}
                tallyWithCommercialActivities={
                  immutableTallyMaps.commercialActivitiesMap
                }
                tallyMap={immutableTallyMaps.tallyMap}
              />
            }
          </div>
          <Paper
            elevation={5}
            className="hidden h-full max-h-full flex-col gap-2 overflow-auto p-2 xl:flex xl:basis-2/5"
          >
            <TallysDataPageActions
              setBooleanConditionsFilter={setBooleanConditionsFilter}
              tallyIds={tallysIds}
              booleanConditionsFilter={booleanConditionsFilter}
            />
            <Divider />
            <div className="0 flex h-full min-h-56 flex-col gap-1 overflow-auto shadow-md">
              <IndividualDataTable tallys={tallys} />
            </div>
          </Paper>
        </div>
      </div>
    </div>
  );
};

export { TallysDataPage };
export { type DataTypesInTallyVisualization, type TallyDataVisualizationModes };
