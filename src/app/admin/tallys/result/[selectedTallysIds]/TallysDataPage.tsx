"use client";

import IndividualDataTableDialogTrigger from "@/app/admin/tallys/result/[selectedTallysIds]/individualDataTableDialogTrigger";
import {
  PersonsDatavisualizationTables,
  TallyComplementaryData,
} from "@/app/admin/tallys/result/[selectedTallysIds]/personsDataVisualizationTables";
import TallysDataPageFilterDialogTrigger from "@/components/tallyDataVisualization/tallysDataPageFilterDialogTrigger";
import CAdminHeader from "@/components/ui/cAdminHeader";
import {
  getDefaultTallyDataPersonFilters,
  immutableTallyData,
  processTallyData,
  TallyDataPersonFilters,
} from "@/lib/utils/tallyDataVisualization";
import { Divider, Paper } from "@mui/material";
import { FinalizedTally } from "@zodValidators";
import { useEffect, useState } from "react";
import React from "react";
import { GrGroup } from "react-icons/gr";

import { IndividualDataTable } from "./individualDataTable";
import { TallysDataPageActions } from "@/components/tallyDataVisualization/tallysDataPageActions";

type DataTypesInTallyVisualization = "PERSONS_DATA" | "COMPLEMENTARY_DATA";
type TallyDataVisualizationModes = "CHART" | "TABLE";

const TallysDataPage = ({
  tallys,
  complementaryData,
  locationName,
  locationUsableArea,
}: {
  tallys: FinalizedTally[];
  complementaryData: TallyComplementaryData;
  locationName: string;
  locationUsableArea: number | null | undefined;
}) => {
  const [personFilters, setPersonFilters] = useState<TallyDataPersonFilters>(
    getDefaultTallyDataPersonFilters,
  );
  const [tallyMap, setTallyMap] = useState<Map<string, number>>(new Map());

  useEffect(() => {
    setTallyMap(processTallyData(tallys, personFilters));
  }, [personFilters, tallys]);
  const immutableTallyMaps = immutableTallyData(tallys);
  return (
    <div className="flex max-h-full min-h-0 max-w-full gap-5 text-black">
      <div className="flex w-full flex-col gap-1 overflow-auto bg-white p-3 shadow-md">
        <CAdminHeader
          titleIcon={<GrGroup size={25} />}
          title={`Resultado de ${tallys.length > 1 ? ` (${tallys.length} contagens)` : "contagem"} em ${locationName}`}
          append={
            <div className="xl:hidden">
              <TallysDataPageFilterDialogTrigger
                setPersonFilters={setPersonFilters}
                personFilters={personFilters}
              />
              <IndividualDataTableDialogTrigger tallys={tallys} />
            </div>
          }
        />
        <div className="flex w-full flex-row gap-5 overflow-auto">
          <div className={"flex w-full flex-col gap-1 overflow-auto"}>
            <PersonsDatavisualizationTables
              tallyMap={tallyMap}
              tallyComplementaryData={complementaryData}
              tallyWithCommercialActivities={
                immutableTallyMaps.commercialActivitiesMap
              }
              locationUsableArea={locationUsableArea}
            />
          </div>
          <Paper
            elevation={5}
            className="hidden h-full max-h-full flex-col gap-2 overflow-auto p-2 xl:flex xl:basis-2/5"
          >
            <TallysDataPageActions
              setPersonFilters={setPersonFilters}
              personFilters={personFilters}
            />
            <Divider />
            <div className="0 flex h-full min-h-56 flex-col gap-1 overflow-auto shadow-md">
              <h3 className="text-2xl font-semibold">Dados das contagens</h3>
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

