"use client";

import { FinalizedAssessmentsList } from "@/serverActions/assessmentUtil";
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
const AssessmentComponent = ({
  id,
  startDate,
  username,
  locationId,
  formId,
}: {
  id: number;
  startDate: string;
  username: string;
  locationId: number;
  formId: number;
}) => {
  const startD = new Date(startDate);
  const weekday = weekdayFormatter.format(startD);
  return (
    <Link
      key={id}
      className="mb-2 flex items-center justify-between rounded bg-white p-2"
      href={`/admin/parks/${locationId}/responses/${formId}/${id}`}
    >
      <span>{`${weekday.charAt(0).toUpperCase() + weekday.slice(1)}, ${dateWithHoursFormatter.format(startD)}`}</span>
      <span className="ml-auto">{username}</span>
    </Link>
  );
};

const AssessmentsList = ({
  locationId,
  formId,
  assessments,
}: {
  locationId: number;
  formId: number;
  assessments: FinalizedAssessmentsList;
}) => {
  return assessments === undefined || assessments.length === 0 ?
      <h3>Nenhuma contagem encontrada para este local!</h3>
    : <div className="w-full text-black">
        {assessments.map((assessment) => (
          <AssessmentComponent
            key={assessment.id}
            id={assessment.id}
            startDate={assessment.startDate.toString()}
            username={assessment.user.username}
            locationId={locationId}
            formId={formId}
          />
        ))}
      </div>;
};

export { AssessmentsList };
