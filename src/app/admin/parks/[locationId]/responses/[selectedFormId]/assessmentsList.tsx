"use client";

import { FinalizedAssessmentsList } from "@serverActions/assessmentUtil";
import { IconCalendarClock, IconUser } from "@tabler/icons-react";
import Link from "next/link";

const weekdayFormatter = new Intl.DateTimeFormat("pt-BR", {
  timeZone: "America/Sao_Paulo",
  weekday: "short",
});
const dateWithHoursFormatter = new Intl.DateTimeFormat("pt-BR", {
  timeZone: "America/Sao_Paulo",
  day: "2-digit",
  month: "2-digit",
  year: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
});

const AssessmentsList = ({
  locationId,
  formId,
  assessments,
}: {
  locationId: number;
  formId: number;
  assessments: FinalizedAssessmentsList["assessments"];
}) => {
  return assessments === undefined || assessments.length === 0 ?
      <h3>Nenhuma avaliação encontrada para este local!</h3>
    : <>
        <div className="flex">
          <span>
            <h3 className="text-xl font-semibold">
              <IconCalendarClock />
            </h3>
          </span>
          <span className="ml-auto">
            <h3 className="text-xl font-semibold">
              <IconUser />
            </h3>
          </span>
        </div>
        <div className="flex w-full flex-col overflow-auto rounded">
          {assessments.map((assessment, index) => {
            const weekday = weekdayFormatter.format(assessment.startDate);
            return (
              <Link
                key={assessment.id}
                className={`flex items-center justify-between ${index % 2 === 0 ? "bg-gray-400/70" : "bg-gray-400/50"} p-2 hover:bg-transparent/10 hover:underline`}
                href={`/admin/parks/${locationId}/responses/${formId}/${assessment.id}`}
              >
                <span>{`${weekday.charAt(0).toUpperCase() + weekday.slice(1)}, ${dateWithHoursFormatter.format(assessment.startDate)}`}</span>
                <span className="ml-auto">{assessment.user.username}</span>
              </Link>
            );
          })}
        </div>
      </>;
};

export { AssessmentsList };
