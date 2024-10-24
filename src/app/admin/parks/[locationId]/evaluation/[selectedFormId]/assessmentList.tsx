"use client";

import Link from "next/link";

import { AssessmentDataFetchedToAssessmentList } from "./page";

const AssessmentComponent = ({
  id,
  startDate,
  username,
  locationId,
  formId,
}: {
  id: number;
  startDate: Date;
  username: string;
  locationId: number;
  formId: number;
}) => {
  return (
    <Link
      className="mb-2 flex items-center justify-between rounded bg-white p-2"
      href={`/admin/parks/${locationId}/evaluation/${formId}/${id}`}
    >
      <span>
        {startDate.toLocaleString("pt-BR", {
          weekday: "short",
          day: "2-digit",
          month: "2-digit",
          year: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        })}
      </span>
      <span className="ml-auto">{username}</span>
    </Link>
  );
};

const AssessmentList = ({
  locationId,
  formId,
  formName,
  assessments,
}: {
  locationId: number;
  formId: number;
  formName: string;
  assessments: AssessmentDataFetchedToAssessmentList[];
}) => {
  return assessments === undefined || assessments.length === 0 ?
      <h3>{`Nenhuma avaliação com o formulário ${formName} em andamento nesta praça`}</h3>
    : <div className="w-full text-black">
        {assessments.map((assessment) => (
          <AssessmentComponent
            key={assessment.id}
            id={assessment.id}
            startDate={assessment.startDate}
            username={assessment.user.username}
            locationId={locationId}
            formId={formId}
          />
        ))}
      </div>;
};

export { AssessmentList };
