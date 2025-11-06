"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";
import { use } from "react";

const AssessmentsTable = ({
  assessmentsPromise,
}: {
  assessmentsPromise: Promise<{
    statusCode: number;
    assessments: {
      id: number;
      startDate: Date;
      endDate: Date | null;
      userId: string;
      locationId: number;
      formId: number;
      createdAt: Date;
      updatedAt: Date;
    }[];
  }>;
}) => {
  const assessmentsData = use(assessmentsPromise);
  console.log(assessmentsData);
  return (
    <Table>
      <TableHead sx={{ backgroundColor: "primary.lighter3" }}>
        <TableRow>
          <TableCell sx={{ width: "50%" }}>Id</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {assessmentsData.assessments.map((assessment, index) => (
          <TableRow key={index}>
            <TableCell sx={{ width: "50%" }}>{`${assessment.id}`}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default AssessmentsTable;
