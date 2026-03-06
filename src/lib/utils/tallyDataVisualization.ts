import { TallyInfoAndCommercialActivitiesObject } from "@/lib/types/tallys/tallyDataVisualization";
import { BooleanPersonProperties } from "@customTypes/tallys/tallys";
import { Activity, AgeGroup, Gender } from "@enums/personCharacteristics";
import { FinalizedTally } from "@zodValidators";
import { z } from "zod";

type TallyDataVisualizationInput = Omit<FinalizedTally, "user"> & {
  user?: FinalizedTally["user"];
};

type BooleanPersonPropertiesWithNoBooleanCharacteristic =
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
];

type TallyPersonData = NonNullable<FinalizedTally["tallyPerson"]>[number]["person"];

export type TallyDataPersonFilters = {
  booleanConditionsFilter: (BooleanPersonProperties | "DEFAULT")[];
  genders: Gender[];
  ageGroups: AgeGroup[];
  activities: Activity[];
};

export const getDefaultTallyDataPersonFilters = (): TallyDataPersonFilters => ({
  booleanConditionsFilter: [],
  genders: Object.values(Gender),
  ageGroups: Object.values(AgeGroup),
  activities: Object.values(Activity),
});

const booleanPersonPropertiesWithNoBooleanCharacteristic: BooleanPersonPropertiesWithNoBooleanCharacteristic[] =
  [
    "isPersonWithImpairment",
    "isTraversing",
    "isInApparentIllicitActivity",
    "isPersonWithoutHousing",
    "noBooleanCharacteristic",
  ];

export const immutableTallyData = (tallys: TallyDataVisualizationInput[]) => {
  const commercialActivitiesMap = new Map<
    number,
    TallyInfoAndCommercialActivitiesObject
  >();
  const tallyMap = new Map<string, number>();
  tallyMap.set("Groups", 0);
  tallyMap.set("Pets", 0);
  tallyMap.set("totalCommercialActivities", 0);

  for (const tally of tallys) {
    commercialActivitiesMap.set(tally.id, {
      tallyInfo: {
        observer: tally.user?.username ?? "",
        startDate: new Date(tally.startDate).toLocaleString(),
      },
      commercialActivities: tally.commercialActivities ?? {},
    });
    if (tally.animalsAmount) {
      tallyMap.set("Pets", (tallyMap.get("Pets") ?? 0) + tally.animalsAmount);
    }
    if (tally.groups) {
      tallyMap.set("Groups", (tallyMap.get("Groups") ?? 0) + tally.groups);
    }
  }
  return {
    tallyMap,
    commercialActivitiesMap,
  };
};

export const shouldIncludePersonByFilters = (
  person: TallyPersonData,
  filters: TallyDataPersonFilters,
) => {
  const {
    booleanConditionsFilter,
    genders,
    ageGroups,
    activities,
  } = filters;

  if (booleanConditionsFilter.length > 0) {
    for (const filter of booleanConditionsFilter) {
      if (filter === "DEFAULT") {
        for (const property of booleanPersonProperties) {
          if (person[property] === true) {
            return false;
          }
        }
      } else if (person[filter] === false) {
        return false;
      }
    }
  }

  if (genders.length > 0 && !genders.includes(person.gender)) {
    return false;
  }

  if (ageGroups.length > 0 && !ageGroups.includes(person.ageGroup)) {
    return false;
  }

  if (activities.length > 0 && !activities.includes(person.activity)) {
    return false;
  }

  return true;
};

export const processTallyData = (
  tallys: TallyDataVisualizationInput[],
  filters: TallyDataPersonFilters,
) => {
  const tallyMap = new Map<string, number>();
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
      if (!shouldIncludePersonByFilters(tallyPerson.person, filters)) {
        continue;
      }
      const key = `${tallyPerson.person.gender}-${tallyPerson.person.ageGroup}-${tallyPerson.person.activity}`;
      tallyMap.set(key, (tallyMap.get(key) ?? 0) + tallyPerson.quantity);
      tallyMap.set(
        `Tot-${tallyPerson.person.gender}-${tallyPerson.person.ageGroup}`,
        (tallyMap.get(
          `Tot-${tallyPerson.person.gender}-${tallyPerson.person.ageGroup}`,
        ) ?? 0) + tallyPerson.quantity,
      );
      tallyMap.set(
        `Tot-${tallyPerson.person.gender}`,
        (tallyMap.get(`Tot-${tallyPerson.person.gender}`) ?? 0) +
          tallyPerson.quantity,
      );
      tallyMap.set(
        "Tot-H&M",
        (tallyMap.get("Tot-H&M") ?? 0) + tallyPerson.quantity,
      );
      for (const gender of Array.from(Object.keys(Gender))) {
        for (const property of booleanPersonPropertiesWithNoBooleanCharacteristic) {
          if (property !== "noBooleanCharacteristic") {
            if (
              tallyPerson.person.gender === (gender as Gender) &&
              tallyPerson.person[property]
            ) {
              tallyMap.set(
                `${gender}-${property}`,
                (tallyMap.get(`${gender}-${property}`) ?? 0) +
                  tallyPerson.quantity,
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
                (tallyMap.get(`${gender}-noBooleanCharacteristic`) ?? 0) +
                  tallyPerson.quantity,
              );
            }
          }
        }
      }
    }
  }

  const totalPeople = z.number().parse(tallyMap.get("Tot-H&M"));
  if (totalPeople !== 0) {
    for (const gender of Object.keys(Gender)) {
      tallyMap.set(
        `%${gender}`,
        ((tallyMap.get(`Tot-${gender}`) ?? 0) / totalPeople) * 100,
      );
    }
    for (const ageGroup of Object.keys(AgeGroup)) {
      let totalAgeGroup = 0;
      for (const gender of Object.keys(Gender)) {
        for (const activity of Object.keys(Activity)) {
          totalAgeGroup +=
            tallyMap.get(`${gender}-${ageGroup}-${activity}`) ?? 0;
        }
      }
      tallyMap.set(`Tot-${ageGroup}`, totalAgeGroup);
      tallyMap.set(`%${ageGroup}`, (totalAgeGroup / totalPeople) * 100);
    }
    for (const activity of Object.keys(Activity)) {
      let activityTotal = 0;
      for (const gender of Object.keys(Gender)) {
        for (const ageGroup of Object.keys(AgeGroup)) {
          activityTotal +=
            tallyMap.get(`${gender}-${ageGroup}-${activity}`) ?? 0;
        }
      }
      tallyMap.set(`Tot-${activity}`, activityTotal);
      tallyMap.set(
        `%${activity}`,
        (activityTotal / (tallyMap.get(`Tot-H&M`) ?? 1)) * 100,
      );
    }
    for (const property of booleanPersonPropertiesWithNoBooleanCharacteristic) {
      let propertyTotal = 0;
      for (const gender of Object.keys(Gender)) {
        propertyTotal += tallyMap.get(`${gender}-${property}`) ?? 0;
      }
      tallyMap.set(`%${property}`, (propertyTotal / totalPeople) * 100);
    }
  }
  return tallyMap;
};
