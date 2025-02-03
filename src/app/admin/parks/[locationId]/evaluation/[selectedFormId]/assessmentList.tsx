"use client";

import Link from "next/link";

import { AssessmentDataFetchedToAssessmentList } from "./page";

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
    : <div className="flex w-full flex-col">
        {assessments.map((assessment, index) => (
          <Link
            key={assessment.id}
            className={`${index % 2 === 0 ? "bg-gray-400/70" : "bg-gray-400/50"} flex items-center justify-between p-2 hover:bg-transparent/10 hover:underline`}
            href={`/admin/parks/${locationId}/evaluation/${formId}/${assessment.id}`}
          >
            <span>
              {assessment.startDate.toLocaleString("pt-BR", {
                weekday: "short",
                day: "2-digit",
                month: "2-digit",
                year: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
            <span className="ml-auto">{assessment.user.username}</span>
          </Link>
        ))}
      </div>;
};

export { AssessmentList };
