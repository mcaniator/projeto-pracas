"use client ";

import { CommercialActivitiesTable } from "@/app/admin/tallys/result/[selectedTallysIds]/commercialActivitiesTable";
import { AbsoluteGraphs } from "@/app/admin/tallys/result/[selectedTallysIds]/graphs/absoluteGraphs";
import ActivityRelativeGraph from "@/app/admin/tallys/result/[selectedTallysIds]/graphs/activityRelativeGraph";
import AgeGroupRelativeGraph from "@/app/admin/tallys/result/[selectedTallysIds]/graphs/ageGroupRelativeGraph";
import GenderRelativeGraph from "@/app/admin/tallys/result/[selectedTallysIds]/graphs/genderRelativeGraph";
import CAccordion from "@/components/ui/accordion/CAccordion";
import CAccordionDetails from "@/components/ui/accordion/CAccordionDetails";
import CAccordionSummary from "@/components/ui/accordion/CAccordionSummary";
import { TallyInfoAndCommercialActivitiesObject } from "@/lib/types/tallys/tallyDataVisualization";
import { Gender } from "@enums/personCharacteristics";
import {
  Divider,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";
import React from "react";

export const ageGroupsNamesInTableMap = new Map([
  ["ADULT", "ADULTOS"],
  ["ELDERLY", "IDOSOS"],
  ["CHILD", "CRIANÇAS"],
  ["TEEN", "JOVENS"],
]);
export const gendersNamesInTableMap = new Map([
  ["MALE", "HOMENS"],
  ["FEMALE", "MULHERES"],
]);
export const activitiesNamesInTableMap = new Map([
  ["SEDENTARY", "Sedentário"],
  ["WALKING", "Caminhando"],
  ["STRENUOUS", "Vigoroso"],
]);
export const booleanCharacteristicsNamesInTableMap = new Map([
  ["noBooleanCharacteristic", "Nenhuma"],
  ["isPersonWithImpairment", "PCD"],
  ["isTraversing", "Passando"],
  ["isInApparentIllicitActivity", "Atividade ilícita"],
  ["isPersonWithoutHousing", "Situação de rua"],
]);
export const ageGroupsInOrder = ["ADULT", "ELDERLY", "CHILD", "TEEN"];
export const gendersInOrder = ["MALE", "FEMALE"];
const activitiesInOrder = ["SEDENTARY", "WALKING", "STRENUOUS"];
export const booleanCharacteristicsInOrder = [
  "noBooleanCharacteristic",
  "isTraversing",
  "isPersonWithImpairment",
  "isInApparentIllicitActivity",
  "isPersonWithoutHousing",
];

export type TallyComplementaryData = {
  groups: number;
  pets: number;
};
const PersonsDatavisualizationTables = ({
  tallyMap,
  tallyComplementaryData,
  tallyWithCommercialActivities,
}: {
  tallyMap: Map<string, number>;
  tallyComplementaryData: TallyComplementaryData;
  tallyWithCommercialActivities: Map<
    number,
    TallyInfoAndCommercialActivitiesObject
  >;
}) => {
  const commercialActivitiesNames: string[] = [];
  let totalCommercialActivities = 0;
  const commercialActivitiesWithTotalOccurrences = new Map<string, number>();
  tallyWithCommercialActivities.forEach((tally) => {
    if (
      tally.commercialActivities &&
      Object.keys(tally.commercialActivities).length > 0
    ) {
      Object.entries(tally.commercialActivities).forEach(([key, value]) => {
        if (value) {
          const previousValue =
            commercialActivitiesWithTotalOccurrences.get(key) || 0;
          commercialActivitiesWithTotalOccurrences.set(
            key,
            previousValue + value,
          );
          totalCommercialActivities += value;
          if (value !== 0 && !commercialActivitiesNames.includes(key)) {
            commercialActivitiesNames.push(key);
          }
        }
      });
    }
  });
  commercialActivitiesNames.sort();
  const commercialActivitiesArray = Array.from(
    commercialActivitiesWithTotalOccurrences,
  );
  commercialActivitiesArray.sort((a, b) => a[0].localeCompare(b[0]));
  const sorrtedOccurrences = commercialActivitiesArray.map(
    (activity) => activity[1],
  );
  return (
    <div className="flex w-full max-w-[85rem] flex-col gap-1 overflow-auto rounded">
      <table className="w-full">
        <thead>
          <tr>
            <th className="broder-gray-500 border xl:p-1">Total de pessoas</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="broder-gray-500 border text-center xl:p-1">
              {tallyMap.get(`Tot-H&M`)}
            </td>
          </tr>
        </tbody>
      </table>
      <CAccordion defaultExpanded>
        <CAccordionSummary>Tabelas de dados gerais</CAccordionSummary>
        <CAccordionDetails className="overflow-auto">
          <h4>Faixa etária - Sexo - Atividade</h4>
          <Table>
            {ageGroupsInOrder.map((ageGroup, ageGroupKey) => {
              return (
                <React.Fragment key={ageGroupKey}>
                  <TableHead sx={{ backgroundColor: "#f1f8e9" }}>
                    <TableRow>
                      <TableCell>
                        {ageGroupsNamesInTableMap.get(ageGroup)}
                      </TableCell>
                      {gendersInOrder.map((gender, genderKey) => {
                        return (
                          <TableCell key={genderKey}>
                            {gendersNamesInTableMap.get(gender)}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {activitiesInOrder.map((activity, activityKey) => {
                      return (
                        <React.Fragment key={activityKey}>
                          <TableRow>
                            <TableCell>
                              {activitiesNamesInTableMap.get(activity)}
                            </TableCell>
                            {gendersInOrder.map((gender, genderKey) => {
                              return (
                                <TableCell key={genderKey}>
                                  {tallyMap.get(
                                    `${gender}-${ageGroup}-${activity}`,
                                  )}
                                </TableCell>
                              );
                            })}
                          </TableRow>
                        </React.Fragment>
                      );
                    })}
                    <TableRow>
                      <TableCell>Total</TableCell>
                      {gendersInOrder.map((gender, genderKey) => {
                        return (
                          <TableCell key={genderKey}>
                            {tallyMap.get(`Tot-${gender}-${ageGroup}`)}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  </TableBody>
                </React.Fragment>
              );
            })}
          </Table>
          <Divider className="pt-4" />
          <h4>Características binárias</h4>
          <Table>
            <TableHead sx={{ backgroundColor: "#f1f8e9" }}>
              <TableRow>
                <TableCell></TableCell>

                {booleanCharacteristicsInOrder.map((characteristic, key) => {
                  return (
                    <TableCell key={key}>
                      {booleanCharacteristicsNamesInTableMap
                        .get(characteristic)
                        ?.toUpperCase()}
                    </TableCell>
                  );
                })}
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell>Total</TableCell>
                {booleanCharacteristicsInOrder.map((characteristic, key) => {
                  return (
                    <TableCell key={key}>
                      {Array.from(Object.keys(Gender))
                        .map(
                          (gender) =>
                            tallyMap.get(`${gender}-${characteristic}`) || 0,
                        )
                        .reduce(
                          (acc, value) =>
                            (
                              typeof acc === "number" &&
                              typeof value === "number"
                            ) ?
                              acc + value
                            : 0,
                          0,
                        )}
                    </TableCell>
                  );
                })}
              </TableRow>
              <TableRow>
                <TableCell>%</TableCell>
                {booleanCharacteristicsInOrder.map((characteristic, key) => {
                  return (
                    <TableCell key={key}>
                      {tallyMap.get(`%${characteristic}`)?.toFixed(2) || 0}%
                    </TableCell>
                  );
                })}
              </TableRow>
            </TableBody>
          </Table>
        </CAccordionDetails>
      </CAccordion>
      <CAccordion defaultExpanded>
        <CAccordionSummary>Gráficos absolutos</CAccordionSummary>
        <CAccordionDetails>
          <AbsoluteGraphs tallyMap={tallyMap} />
        </CAccordionDetails>
      </CAccordion>
      <CAccordion defaultExpanded>
        <CAccordionSummary>Gráficos percentuais</CAccordionSummary>
        <CAccordionDetails>
          <div className="flex flex-wrap gap-1">
            <GenderRelativeGraph tallyMap={tallyMap} />
            <ActivityRelativeGraph tallyMap={tallyMap} />
            <AgeGroupRelativeGraph tallyMap={tallyMap} />
          </div>
        </CAccordionDetails>
      </CAccordion>
      <Divider className="pt-4" />
      <CAccordion defaultExpanded>
        <CAccordionSummary>Grupos / Pets</CAccordionSummary>
        <CAccordionDetails>
          <Table>
            <TableHead sx={{ backgroundColor: "#f1f8e9" }}>
              <TableRow>
                <TableCell>Grupos</TableCell>
                <TableCell>Pets</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell>{tallyComplementaryData.groups}</TableCell>
                <TableCell>{tallyComplementaryData.pets}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CAccordionDetails>
      </CAccordion>
      <CAccordion defaultExpanded>
        <CAccordionSummary>Ativdades comerciais itinerantes</CAccordionSummary>
        <CAccordionDetails className="overflow-auto">
          <CommercialActivitiesTable
            tallyWithCommercialActivities={tallyWithCommercialActivities}
            sortedCommercialActivitiesNames={commercialActivitiesNames}
            totalCommercialActivities={totalCommercialActivities}
            sortedOccurrences={sorrtedOccurrences}
          />
        </CAccordionDetails>
      </CAccordion>
    </div>
  );
};

export { PersonsDatavisualizationTables };
