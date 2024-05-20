"use client ";

import { Tally } from "@prisma/client";

const MainTallyDataTable = ({
  tallys,
  genderFilter,
  ageGroupFilter,
  activityFilter,
  booleanConditionsFilter,
}: {
  tallys: Tally[];
  genderFilter: string[];
  ageGroupFilter: string[];
  activityFilter: string[];
  booleanConditionsFilter: string[];
}) => {
  return <div></div>;
};

export { MainTallyDataTable };
