"use client";

import { tallyDataToCreateTableType } from "@/lib/zodValidators";
import { personType } from "@/lib/zodValidators";
import { Gender } from "@prisma/client";
import { AgeGroup } from "@prisma/client";
import { Activity } from "@prisma/client";
import { useEffect, useState } from "react";
import { z } from "zod";

import { DataFilter } from "./dataFilter";
import { IndividualDataTable } from "./individualDataTable";
import { MainTallyDataTableComplementary } from "./mainTallyDataTableComplementary";
import { MainTallyDataTablePeople } from "./mainTallyDataTablePeople";

const booleanPersonProperties: (keyof personType)[] = [
  "isPersonWithImpairment",
  "isTraversing",
  "isInApparentIllicitActivity",
  "isPersonWithoutHousing",
];
const otherPropertiesToCalcualtePercentage = [
  "isInApparentIllicitActivity",
  "isPersonWithoutHousing",
];
const possibleDataTypes = ["peopleData", "complementaryData"] as const;
type dataTypesToShowInTallyTable = (typeof possibleDataTypes)[number];
const imutableTallyData = (tallys: tallyDataToCreateTableType[]) => {
  const tallyMap = new Map();
  tallyMap.set("Groups", 0);
  tallyMap.set("Pets", 0);
  tallyMap.set("commercialActivities", 0);
  for (const tally of tallys) {
    if (tally.animalsAmount) {
      tallyMap.set("Pets", tallyMap.get("Pets") + tally.animalsAmount);
    }
    if (tally.commercialActivities) {
      tallyMap.set(
        "commercialActivities",
        tallyMap.get("commercialActivities") + tally.commercialActivities,
      );
    }
  }
  return tallyMap;
};
const processTallyData = (
  tallys: tallyDataToCreateTableType[],
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
  tallyMap.set("isPersonWithImpairment", 0);
  tallyMap.set("Groups", 0);
  tallyMap.set("isTraversing", 0);
  tallyMap.set("isInApparentIllicitActivity", 0);
  tallyMap.set("%isInApparentIllicitActivity", "0.00%");
  tallyMap.set("isPersonWithoutHousing", 0);
  tallyMap.set("%isPersonWithoutHousing", "0.00%");
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
      booleanPersonProperties.map((property) => {
        if (tallyPerson.person[property]) {
          tallyMap.set(property, tallyMap.get(property) + tallyPerson.quantity);
        }
      });
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
    for (const property of otherPropertiesToCalcualtePercentage) {
      tallyMap.set(
        `%${property}`,
        ((tallyMap.get(`${property}`) / totalPeople) * 100).toFixed(2) + "%",
      );
    }
  }
  return tallyMap;
};
const TallysDataPage = ({
  locationName,
  tallys,
}: {
  locationName: string;
  tallys: tallyDataToCreateTableType[];
}) => {
  const [booleanConditionsFilter, setBooleanConditionsFilter] = useState<
    (keyof personType)[]
  >([]);
  const [tallyMap, setTallyMap] = useState<Map<string, string | number>>(
    new Map(),
  );
  const [dataTypeToShow, setDataTypeToShow] = useState<string>("peopleData");
  useEffect(() => {
    setTallyMap(processTallyData(tallys, booleanConditionsFilter));
  }, [booleanConditionsFilter, tallys]);
  const imutableTallyMap = imutableTallyData(tallys);
  return (
    <div className="flex max-h-[calc(100vh-5.5rem)] min-h-0 gap-5 p-5">
      <div className="flex  basis-3/6 flex-col gap-1 overflow-auto rounded-3xl bg-gray-300/30 p-3 text-white shadow-md">
        <h3 className="text-2xl font-semibold">{`Contagem realizada em ${locationName}`}</h3>
        {dataTypeToShow === "peopleData" ?
          tallys.length > 0 ?
            <MainTallyDataTablePeople tallyMap={tallyMap} />
          : <h3 className="text-xl font-semibold">Contagem não encontrada!</h3>
        : tallys.length > 0 ?
          <MainTallyDataTableComplementary tallyMap={imutableTallyMap} />
        : <h3 className="text-xl font-semibold">Contagem não encontrada!</h3>}
      </div>
      <div className="flex flex-col gap-5">
        <div className=" flex flex-col gap-1  rounded-3xl bg-gray-300/30 p-3 text-white shadow-md">
          <h3 className="text-2xl font-semibold">Filtros</h3>

          <DataFilter
            setBooleanConditionsFilter={setBooleanConditionsFilter}
            setDataTypeToShow={setDataTypeToShow}
          />
        </div>

        <IndividualDataTable tallys={tallys} />
      </div>
    </div>
  );
};

export { TallysDataPage };
export { type dataTypesToShowInTallyTable };
