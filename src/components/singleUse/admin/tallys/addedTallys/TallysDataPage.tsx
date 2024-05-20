"use client";

import { Tally } from "@prisma/client";
import { useState } from "react";

import { DataFilter } from "./dataFilter";
import { IndividualDataTable } from "./individualDataTable";
import { MainTallyDataTable } from "./mainTallyDataTable";

const TallysDataPage = ({
  locationName,
  tallys,
}: {
  locationName: string;
  tallys: Tally[];
}) => {
  const [genderFilter, setGenderFilter] = useState<string[]>([]);
  const [ageGroupFilter, setAgeGroupFilter] = useState<string[]>([]);
  const [activityFilter, setActivityFilter] = useState<string[]>([]);
  const [booleanConditionsFilter, setBooleanConditionsFilter] = useState<
    string[]
  >([]);
  return (
    <div className="flex max-h-[calc(100vh-5.5rem)] min-h-0 gap-5 p-5">
      <div className="flex basis-3/5 flex-col gap-1 rounded-3xl bg-gray-300/30 p-3 text-white shadow-md">
        <h3 className="text-2xl font-semibold">{`Contagem realizada em ${locationName}`}</h3>
        <MainTallyDataTable
          tallys={tallys}
          genderFilter={genderFilter}
          ageGroupFilter={ageGroupFilter}
          activityFilter={activityFilter}
          booleanConditionsFilter={booleanConditionsFilter}
        />
      </div>
      <div className="flex  flex-col gap-5">
        <div className=" flex flex-col gap-1  rounded-3xl bg-gray-300/30 p-3 text-white shadow-md">
          <h3 className="text-2xl font-semibold">Filtros</h3>

          <DataFilter
            setActivityFilter={setActivityFilter}
            setAgeGroupFilter={setAgeGroupFilter}
            setBooleanConditionsFilter={setBooleanConditionsFilter}
            setGenderFilter={setGenderFilter}
          />
        </div>
        <div className=" flex  flex-col gap-1 overflow-auto rounded-3xl bg-gray-300/30 p-3 text-white shadow-md">
          <h3 className="text-2xl font-semibold">Dados sobre as contagens</h3>
          <div className="flex max-w-96 flex-row gap-5 overflow-auto">
            <IndividualDataTable tallys={tallys} />
          </div>
        </div>
      </div>
    </div>
  );
};

export { TallysDataPage };
