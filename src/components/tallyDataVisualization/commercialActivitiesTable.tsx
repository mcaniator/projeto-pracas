"use client";

import { TallyInfoAndCommercialActivitiesObject } from "@customTypes/tallys/tallyDataVisualization";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";

const CommercialActivitiesTable = ({
  tallyWithCommercialActivities,
  sortedCommercialActivitiesNames,
  totalCommercialActivities,
  sortedOccurrences,
}: {
  tallyWithCommercialActivities: Map<
    number,
    TallyInfoAndCommercialActivitiesObject
  >;
  sortedCommercialActivitiesNames: string[];
  totalCommercialActivities: number;
  sortedOccurrences: number[];
}) => {
  const commercialActivitiesWithTallys: {
    [key: string]: { tally: string; occurrences: number }[];
  } = {};
  for (const tally of tallyWithCommercialActivities) {
    const [, tallyObj] = tally;
    const { tallyInfo, commercialActivities } = tallyObj;
    const tallyUserAndDate = `${tallyInfo.observer} - ${tallyInfo.startDate}`;
    if (!commercialActivities) {
      continue;
    }
    const commercialActivitiesInTally = Object.keys(commercialActivities);
    for (const commercialActivityInTally of commercialActivitiesInTally) {
      if (!commercialActivitiesWithTallys[commercialActivityInTally]) {
        commercialActivitiesWithTallys[commercialActivityInTally] = [];
      }
      commercialActivitiesWithTallys[commercialActivityInTally].push({
        tally: tallyUserAndDate,
        occurrences: commercialActivities[commercialActivityInTally] || 0,
      });
    }
  }
  return (
    <div>
      <table className="w-full">
        <thead>
          <tr>
            <th className="broder-gray-500 border xl:p-1">Total</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="broder-gray-500 border text-center xl:p-1">
              {totalCommercialActivities}
            </td>
          </tr>
        </tbody>
      </table>

      <Table className="mt-2">
        <TableHead sx={{ backgroundColor: "#f1f8e9" }}>
          <TableRow>
            <TableCell>Tipos</TableCell>
            {sortedCommercialActivitiesNames.length ?
              sortedCommercialActivitiesNames.map((commercialActivity, key) => {
                return <TableCell key={key}>{commercialActivity}</TableCell>;
              })
            : <TableCell>-</TableCell>}
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            <TableCell>Total por tipo</TableCell>
            {sortedOccurrences.length ?
              sortedOccurrences.map((occurrences, key) => {
                return <TableCell key={key}>{occurrences}</TableCell>;
              })
            : <TableCell>-</TableCell>}
          </TableRow>
          {Array.from(tallyWithCommercialActivities).map(
            ([tallyId, commercialActivitiesObject]) => {
              return (
                <TableRow key={tallyId}>
                  <TableCell>
                    {`${commercialActivitiesObject.tallyInfo.startDate} - ${commercialActivitiesObject.tallyInfo.observer}`}
                  </TableCell>
                  {sortedCommercialActivitiesNames.length ?
                    sortedCommercialActivitiesNames.map(
                      (commercialActivityName, key) => {
                        return (
                          <TableCell key={key}>
                            {commercialActivitiesObject.commercialActivities ?
                              (
                                commercialActivitiesObject.commercialActivities[
                                  commercialActivityName
                                ] !== 0
                              ) ?
                                commercialActivitiesObject.commercialActivities[
                                  commercialActivityName
                                ]
                              : ""
                            : ""}
                          </TableCell>
                        );
                      },
                    )
                  : <TableCell>-</TableCell>}
                </TableRow>
              );
            },
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export { CommercialActivitiesTable };
