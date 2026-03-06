import { CommercialActivitiesTable } from "@/app/admin/tallys/result/[selectedTallysIds]/commercialActivitiesTable";
import ActivityRelativeGraph from "@/app/admin/tallys/result/[selectedTallysIds]/graphs/activityRelativeGraph";
import AgeGroupRelativeGraph from "@/app/admin/tallys/result/[selectedTallysIds]/graphs/ageGroupRelativeGraph";
import GenderRelativeGraph from "@/app/admin/tallys/result/[selectedTallysIds]/graphs/genderRelativeGraph";
import { TallysDataPageActions } from "@/app/admin/tallys/result/[selectedTallysIds]/tallysDataPageActions";
import TallysDataPageFilterDialogTrigger from "@/app/admin/tallys/result/[selectedTallysIds]/tallysDataPageFilterDialogTrigger";
import { dateTimeFormatter } from "@/lib/formatters/dateFormatters";
import type { PublicFinalizedTally } from "@/lib/serverFunctions/queries/public/tally";
import {
  getDefaultTallyDataPersonFilters,
  immutableTallyData,
  processTallyData,
  shouldIncludePersonByFilters,
  TallyDataPersonFilters,
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

const extraCharacteristics: {
  key: BooleanPersonProperties;
  label: string;
}[] = [
  { key: "isPersonWithoutHousing", label: "Em situação de rua" },
  { key: "isTraversing", label: "Em deslocamento" },
  { key: "isInApparentIllicitActivity", label: "Atividade ilícita aparente" },
  { key: "isPersonWithImpairment", label: "Pessoa com deficiência" },
];

const LocationTallyDetailsDialogContent = ({
  tally,
}: {
  tally: PublicFinalizedTally;
}) => {
  const [personFilters, setPersonFilters] = useState<TallyDataPersonFilters>(
    getDefaultTallyDataPersonFilters,
  );
  const [tallyMap, setTallyMap] = useState<Map<string, number>>(new Map());

  const tallys = useMemo(() => [tally], [tally]);
  const immutableTallyMaps = useMemo(
    () => immutableTallyData(tallys),
    [tallys],
  );

  useEffect(() => {
    setTallyMap(processTallyData(tallys, personFilters));
  }, [personFilters, tallys]);

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

  const extraCharacteristicsData = useMemo(() => {
    const tallyPeople = tally.tallyPerson ?? [];
    const totals = new Map<BooleanPersonProperties, number>(
      extraCharacteristics.map((item) => [item.key, 0]),
    );
    let totalPeople = 0;

    for (const tallyPerson of tallyPeople) {
      const quantity = tallyPerson.quantity;
      const person = tallyPerson.person;
      if (!shouldIncludePersonByFilters(person, personFilters)) continue;

      totalPeople += quantity;

      for (const characteristic of extraCharacteristics) {
        if (person[characteristic.key]) {
          totals.set(
            characteristic.key,
            (totals.get(characteristic.key) ?? 0) + quantity,
          );
        }
      }
    }

    const bars = extraCharacteristics.map((characteristic) => {
      const count = totals.get(characteristic.key) ?? 0;
      const percentage = totalPeople > 0 ? (count / totalPeople) * 100 : 0;
      return {
        ...characteristic,
        count,
        percentage,
      };
    });

    return {
      totalPeople,
      bars,
    };
  }, [personFilters, tally.tallyPerson]);

  const hasCommercialActivities =
    commercialActivitiesData.totalCommercialActivities > 0;

  return (
    <div className="flex h-full min-h-0 w-full gap-4 overflow-hidden text-black">
      <div className="flex h-full min-h-0 w-full flex-col gap-3 overflow-auto rounded bg-white p-2">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex flex-col text-sm text-gray-500">
              <span className="block">
                Início: {dateTimeFormatter.format(new Date(tally.startDate))}
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
              setPersonFilters={setPersonFilters}
              personFilters={personFilters}
            />
          </div>
        </div>

        <Paper elevation={2} className="p-2">
          <h4 className="text-lg font-semibold">Pessoas</h4>
          <Divider className="my-2" />
          <div className="flex flex-wrap justify-center gap-1">
            <GenderRelativeGraph tallyMap={tallyMap} />
            <ActivityRelativeGraph tallyMap={tallyMap} />
            <AgeGroupRelativeGraph tallyMap={tallyMap} />
          </div>
        </Paper>

        <Paper elevation={2} className="p-2">
          <h4 className="text-lg font-semibold">Condições das pessoas</h4>
          <span className="text-xs text-gray-500">
            Base: {extraCharacteristicsData.totalPeople} pessoas (contagens não
            exclusivas)
          </span>
          <Divider className="my-2" />
          <div className="flex flex-col gap-2">
            {extraCharacteristicsData.bars.map((bar) => (
              <div key={bar.key} className="flex flex-col gap-1">
                <div className="flex items-center justify-between text-sm">
                  <span>{bar.label}</span>
                  <span>
                    {bar.count} ({bar.percentage.toFixed(1)}%)
                  </span>
                </div>
                <div className="h-2 w-full rounded bg-gray-200">
                  <div
                    className="bg-emerald-600 h-2 rounded"
                    style={{
                      width: `${Math.min(100, bar.percentage)}%`,
                    }}
                  />
                </div>
              </div>
            ))}
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
          setPersonFilters={setPersonFilters}
          personFilters={personFilters}
        />
      </Paper>
    </div>
  );
};

export default LocationTallyDetailsDialogContent;
