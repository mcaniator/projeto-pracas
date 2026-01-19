"use client";

import {
  Chip,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";
import {
  IconClipboard,
  IconDots,
  IconDotsVertical,
  IconPlus,
  IconUser,
} from "@tabler/icons-react";
import Link from "next/link";
import { use, useState } from "react";

import CButton from "../../../../../components/ui/cButton";
import { dateTimeFormatter } from "../../../../../lib/formatters/dateFormatters";
import AssessmentCreationDialog from "./assessmentCreationDialog";

const AssessmentsTable = ({
  locationId,
  location,
  assessmentsPromise,
  formsPromise,
}: {
  locationId: number;
  location: { name: string };
  assessmentsPromise: Promise<{
    statusCode: number;
    assessments: {
      id: number;
      startDate: Date;
      endDate: Date | null;
      username: string;
      formName: string;
      status: string;
    }[];
  }>;
  formsPromise: Promise<{
    statusCode: number;
    forms: {
      id: number;
      updatedAt: Date;
      name: string;
      finalized: boolean;
    }[];
  }>;
}) => {
  const assessmentsData = use(assessmentsPromise);
  const [openAssessmentCreationDialog, setOpenAssessmentCreationDialog] =
    useState(false);
  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className="flex w-full justify-between sm:max-w-[25vw]">
        <CButton
          color="secondary"
          onClick={() => {
            setOpenAssessmentCreationDialog(true);
          }}
        >
          <IconPlus />
        </CButton>
        <CButton color="secondary">
          <IconDotsVertical />
        </CButton>
      </div>

      {assessmentsData.assessments.map((a, index) => (
        <Link
          className={`flex h-auto w-full cursor-pointer flex-row gap-4 rounded-full bg-main p-2 pl-12 shadow-xl transition-transform duration-300 ease-in-out hover:scale-110 sm:max-w-[30vw]`}
          key={index}
          href={`/admin/parks/${locationId}/assessments/${a.id}`}
        >
          <div>
            <div className="text-2xl font-semibold">
              Avaliação #{a.id}{" "}
              <Chip
                color={a.endDate ? "secondary" : "error"}
                label={a.status}
              />
            </div>
            <p className="text-l font-medium">
              Início: {dateTimeFormatter.format(new Date(a.startDate))}
            </p>
            {a.endDate && (
              <p className="text-l font-medium">
                Fim: {dateTimeFormatter.format(new Date(a.endDate))}
              </p>
            )}

            <div className="flex font-medium">
              <IconUser /> {a.username}
            </div>
            <div className="flex font-medium">
              <IconClipboard /> {a.formName}
            </div>
          </div>
        </Link>
      ))}
      <AssessmentCreationDialog
        locationName={location.name}
        open={openAssessmentCreationDialog}
        onClose={() => {
          setOpenAssessmentCreationDialog(false);
        }}
        formsPromise={formsPromise}
      />
    </div>
  );
  /*return (
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
  );*/
};

export default AssessmentsTable;
