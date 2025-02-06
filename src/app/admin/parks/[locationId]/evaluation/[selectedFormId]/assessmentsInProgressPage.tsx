"use client";

import { useEffect, useState } from "react";

import AssessmentCreation from "./assessmentCreation";
import { AssessmentList } from "./assessmentList";
import { AssessmentDataFetchedToAssessmentList } from "./page";

const AssessmentsInProgressPage = ({
  locationId,
  formId,
  userId,
  locationName,
  formName,
  assessments,
}: {
  locationId: number;
  formId: number;
  userId: string;
  locationName: string;
  formName: string;
  assessments: AssessmentDataFetchedToAssessmentList[];
}) => {
  const [isMobileView, setIsMobileView] = useState(false);
  useEffect(() => {
    window.addEventListener("resize", () => {
      if (window.innerWidth < 1100) {
        setIsMobileView(true);
      } else {
        setIsMobileView(false);
      }
    });
    if (window.innerWidth < 1100) {
      setIsMobileView(true);
    } else {
      setIsMobileView(false);
    }
  }, []);
  return (
    <div className={"flex max-h-full min-h-0 flex-col gap-5"}>
      <div
        className={`flex gap-5 overflow-auto rounded-3xl bg-gray-300/30 p-3 text-white shadow-md ${isMobileView && "flex-col items-center"}`}
      >
        {isMobileView && (
          <h3 className={"text-2xl font-semibold"}>
            {`Avaliações em andamento do formulário ${formName} em ${locationName}`}
          </h3>
        )}

        {!isMobileView && (
          <div className={"flex basis-3/5 flex-col gap-1 overflow-auto"}>
            {!assessments || assessments.length === 0 ?
              <h3>Nenhuma avaliação finalizada para este local!</h3>
            : <>
                <AssessmentList
                  locationId={locationId}
                  formId={formId}
                  formName={formName}
                  assessments={assessments}
                />
              </>
            }
          </div>
        )}
        <div
          className={`flex h-fit ${!isMobileView && "min-w-[530px]"} flex-col gap-1 rounded-3xl bg-gray-400/20 p-3 shadow-inner`}
        >
          <AssessmentCreation
            locationId={locationId}
            formId={formId}
            userId={userId}
          />
        </div>
        {isMobileView && (
          <div className={"flex w-full flex-col gap-1"}>
            {!assessments || assessments.length === 0 ?
              <h3>Nenhuma avaliação finalizada para este local!</h3>
            : <>
                <AssessmentList
                  locationId={locationId}
                  formId={formId}
                  formName={formName}
                  assessments={assessments}
                />
              </>
            }
          </div>
        )}
      </div>
    </div>
  );
};

export default AssessmentsInProgressPage;
