"use client";

import { useEffect, useState } from "react";

import { useHelperCard } from "../../../../../../components/context/helperCardContext";
import AssessmentCreation from "./assessmentCreation";
import { AssessmentList } from "./assessmentList";
import { AssessmentDataFetchedToAssessmentList } from "./page";

const AssessmentsInProgressPage = ({
  locationId,
  formId,
  locationName,
  formName,
  assessments,
}: {
  locationId: number;
  formId: number;
  locationName: string;
  formName: string;
  assessments: {
    statusCode: number;
    assessments: AssessmentDataFetchedToAssessmentList[];
  };
}) => {
  const { setHelperCard } = useHelperCard();
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

  useEffect(() => {
    if (assessments.statusCode === 401) {
      setHelperCard({
        show: true,
        helperCardType: "ERROR",
        content: <>Sem permissão para acessar avaliações!</>,
      });
    } else if (assessments.statusCode === 500) {
      setHelperCard({
        show: true,
        helperCardType: "ERROR",
        content: <>Erro ao acessar avaliações!</>,
      });
    }
  }, [assessments, setHelperCard]);
  return (
    <div className={"flex max-h-full min-h-0 flex-col gap-5"}>
      <div
        className={`flex gap-5 overflow-auto rounded-3xl bg-gray-300/30 p-3 shadow-md ${isMobileView && "flex-col items-center"}`}
      >
        {isMobileView && (
          <h3 className={"text-2xl font-semibold"}>
            {`Avaliações em andamento do formulário ${formName} em ${locationName}`}
          </h3>
        )}

        {!isMobileView && (
          <div className={"flex w-full flex-col gap-1 overflow-auto"}>
            {!assessments || assessments.assessments.length === 0 ?
              <h3>Nenhuma avaliação em progresso para este local!</h3>
            : <>
                <AssessmentList
                  locationId={locationId}
                  formId={formId}
                  formName={formName}
                  assessments={assessments.assessments}
                />
              </>
            }
          </div>
        )}
        <div className={`flex h-fit ${!isMobileView} rounded-3xl shadow-inner`}>
          <AssessmentCreation locationId={locationId} formId={formId} />
        </div>
        {isMobileView && (
          <div className={"flex w-full flex-col gap-1"}>
            {!assessments || assessments.assessments.length === 0 ?
              <h3>Nenhuma avaliação em progresso para este local!</h3>
            : <>
                <AssessmentList
                  locationId={locationId}
                  formId={formId}
                  formName={formName}
                  assessments={assessments.assessments}
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
