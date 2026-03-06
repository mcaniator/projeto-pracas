import { CommercialActivitiesTable } from "@/app/admin/tallys/result/[selectedTallysIds]/commercialActivitiesTable";
import ActivityRelativeGraph from "@/app/admin/tallys/result/[selectedTallysIds]/graphs/activityRelativeGraph";
import AgeGroupRelativeGraph from "@/app/admin/tallys/result/[selectedTallysIds]/graphs/ageGroupRelativeGraph";
import GenderRelativeGraph from "@/app/admin/tallys/result/[selectedTallysIds]/graphs/genderRelativeGraph";
import { TallysDataPageActions } from "@/app/admin/tallys/result/[selectedTallysIds]/tallysDataPageActions";
import TallysDataPageFilterDialogTrigger from "@/app/admin/tallys/result/[selectedTallysIds]/tallysDataPageFilterDialogTrigger";
import { dateTimeFormatter } from "@/lib/formatters/dateFormatters";
import type { PublicFinalizedTally } from "@/lib/serverFunctions/queries/public/tally";
import {
  immutableTallyData,
  processTallyData,
} from "@/lib/utils/tallyDataVisualization";
import { BooleanPersonProperties } from "@customTypes/tallys/tallys";
import {
  Divider,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";

const LocationTallyDetailsDialogContent = ({
  tally,
}: {
  tally: PublicFinalizedTally;
}) => {
  const [booleanConditionsFilter, setBooleanConditionsFilter] = useState<
    (BooleanPersonProperties | "DEFAULT")[]
  >([]);
  const [tallyMap, setTallyMap] = useState<Map<string, number>>(new Map());

  const tallys = useMemo(() => [tally], [tally]);
  const immutableTallyMaps = useMemo(
    () => immutableTallyData(tallys),
    [tallys],
  );

  useEffect(() => {
    setTallyMap(processTallyData(tallys, booleanConditionsFilter));
  }, [booleanConditionsFilter, tallys]);

  const commercialActivitiesData = useMemo(() => {
    let totalCommercialActivities = 0;
    const commercialActivitiesWithTotalOccurrences = new Map<string, number>();

    immutableTallyMaps.commercialActivitiesMap.forEach((tallyData) => {
      if (
        tallyData.commercialActivities &&
        Object.keys(tallyData.commercialActivities).length > 0
      ) {
        Object.entries(tallyData.commercialActivities).forEach(
          ([key, value]) => {
            if (value) {
              const previousValue =
                commercialActivitiesWithTotalOccurrences.get(key) || 0;
              commercialActivitiesWithTotalOccurrences.set(
                key,
                previousValue + value,
              );
              totalCommercialActivities += value;
            }
          },
        );
      }
    });

    const sortedCommercialActivities = Array.from(
      commercialActivitiesWithTotalOccurrences,
    ).sort((a, b) => a[0].localeCompare(b[0]));

    return {
      names: sortedCommercialActivities.map((activity) => activity[0]),
      occurrences: sortedCommercialActivities.map((activity) => activity[1]),
      totalCommercialActivities,
    };
  }, [immutableTallyMaps.commercialActivitiesMap]);

  const complementaryData = useMemo(
    () => ({
      groups: tally.groups || 0,
      pets: tally.animalsAmount || 0,
    }),
    [tally.animalsAmount, tally.groups],
  );
  const hasCommercialActivities =
    commercialActivitiesData.totalCommercialActivities > 0;

  return (
    <div className="flex h-full min-h-0 w-full gap-4 overflow-hidden text-black">
      <div className="flex h-full min-h-0 w-full flex-col gap-3 overflow-auto rounded bg-white p-2">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="text-sm text-gray-500">
              <span className="block">
                inicio: {dateTimeFormatter.format(new Date(tally.startDate))}
              </span>
              <span className="block">
                fim:{" "}
                {tally.endDate ?
                  dateTimeFormatter.format(new Date(tally.endDate))
                : "-"}
              </span>
            </div>
          </div>
          <div className="xl:hidden">
            <TallysDataPageFilterDialogTrigger
              setBooleanConditionsFilter={setBooleanConditionsFilter}
              booleanConditionsFilter={booleanConditionsFilter}
            />
          </div>
        </div>

        <Paper elevation={2} className="p-2">
          <h4 className="text-lg font-semibold">Pessoas</h4>
          <Divider className="my-2" />
          <div className="flex flex-wrap gap-1">
            <GenderRelativeGraph tallyMap={tallyMap} />
            <ActivityRelativeGraph tallyMap={tallyMap} />
            <AgeGroupRelativeGraph tallyMap={tallyMap} />
          </div>
        </Paper>

        <Paper elevation={2} className="p-2">
          <h4 className="text-lg font-semibold">Dados de grupos e animais</h4>
          <Divider className="my-2" />
          <Table>
            <TableHead sx={{ backgroundColor: "#f1f8e9" }}>
              <TableRow>
                <TableCell>Grupos</TableCell>
                <TableCell>Pets</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell>{complementaryData.groups}</TableCell>
                <TableCell>{complementaryData.pets}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Paper>

        {hasCommercialActivities && (
          <Paper elevation={2} className="p-2">
            <h4 className="text-lg font-semibold">
              Atividades comerciais itinerantes
            </h4>
            <Divider className="my-2" />
            <CommercialActivitiesTable
              tallyWithCommercialActivities={
                immutableTallyMaps.commercialActivitiesMap
              }
              sortedCommercialActivitiesNames={commercialActivitiesData.names}
              totalCommercialActivities={
                commercialActivitiesData.totalCommercialActivities
              }
              sortedOccurrences={commercialActivitiesData.occurrences}
            />
          </Paper>
        )}
      </div>

      <Paper
        elevation={5}
        className="hidden h-full max-h-full min-h-72 basis-96 flex-col gap-2 overflow-auto p-2 xl:flex"
      >
        <TallysDataPageActions
          setBooleanConditionsFilter={setBooleanConditionsFilter}
          booleanConditionsFilter={booleanConditionsFilter}
        />
      </Paper>
    </div>
  );
};

export default LocationTallyDetailsDialogContent;
