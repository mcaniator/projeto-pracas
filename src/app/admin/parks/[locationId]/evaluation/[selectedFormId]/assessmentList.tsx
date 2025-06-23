"use client";

import { IconCalendarClock, IconUser } from "@tabler/icons-react";
import Link from "next/link";

import { useUserContext } from "../../../../../../components/context/UserContext";
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
  const { user } = useUserContext();
  const isAssessmentManager = user.roles.includes("ASSESSMENT_MANAGER");
  return assessments === undefined || assessments.length === 0 ?
      <h3>{`Nenhuma avaliação com o formulário ${formName} em andamento nesta praça`}</h3>
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
            if (isAssessmentManager || user.id === assessment.user.id) {
              return (
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
              );
            } else {
              return (
                <div
                  key={assessment.id}
                  className={`flex items-center justify-between ${index % 2 === 0 ? "bg-gray-400/70" : "bg-gray-400/50"} p-2 text-red-300`}
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
                </div>
              );
            }
          })}
        </div>
      </>;
};

export { AssessmentList };
