"use client";

import CPersonCharacteristicGroupTypeChip from "@/components/ui/personCharacteristic/cPersonCharacteristicGroupTypeChip";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import { useMemo } from "react";

import type { TallyPersonsStatiticsProps } from "./tallyPersonsStatiticsTypes";
import {
  getPercentageOfPeople,
  getQuantityByCharacteristicId,
  getTotalPeople,
} from "./tallyPersonsStatiticsUtils";

const TallyPersonsStatiticsTables = ({
  modularTallyTemplateStructure,
  personObservations,
}: TallyPersonsStatiticsProps) => {
  const quantityByCharacteristicId = useMemo(
    () => getQuantityByCharacteristicId(personObservations),
    [personObservations],
  );
  const totalPeople = useMemo(
    () => getTotalPeople(personObservations),
    [personObservations],
  );

  return (
    <div className="flex w-full flex-col gap-3">
      {modularTallyTemplateStructure.tallyTemplateGroups.map((group) => (
        <section
          key={group.id}
          className="rounded border border-gray-300 bg-slate-50 p-2"
        >
          <h3 className="mb-2 flex items-center gap-2 text-lg font-semibold">
            {group.personCharacteristicGroup.title}
            <CPersonCharacteristicGroupTypeChip
              isTagGroup={group.personCharacteristicGroup.isTagGroup}
            />
          </h3>
          <TableContainer component={Paper} elevation={1}>
            <Table
              size="small"
              aria-label={group.personCharacteristicGroup.title}
            >
              <TableHead sx={{ backgroundColor: "#f1f8e9" }}>
                <TableRow>
                  <TableCell>Característica</TableCell>
                  <TableCell align="right">Total</TableCell>
                  <TableCell align="right">%</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {group.characteristics.map(({ personCharacteristic }) => {
                  const total =
                    quantityByCharacteristicId.get(personCharacteristic.id) ??
                    0;
                  const percentage = getPercentageOfPeople(total, totalPeople);

                  return (
                    <TableRow key={personCharacteristic.id}>
                      <TableCell component="th" scope="row">
                        {personCharacteristic.name}
                      </TableCell>
                      <TableCell align="right">{total}</TableCell>
                      <TableCell align="right">
                        {percentage.toFixed(1)}%
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </section>
      ))}
    </div>
  );
};

export default TallyPersonsStatiticsTables;
