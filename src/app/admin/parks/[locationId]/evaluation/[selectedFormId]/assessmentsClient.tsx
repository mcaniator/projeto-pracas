"use client";

import AssessmentCreation from "./assessmentCreation";
import { AssessmentList } from "./assessmentList";

interface AssessmentDataFetchedToAssessmentList {
  id: number;
  startDate: Date;
  user: {
    username: string;
  };
}

const AssessmentsClient = ({
  locationId,
  locationName,
  userId,
  formId,
  formName,
  assessments,
}: {
  locationId: number;
  locationName: string;
  userId: string;
  formId: number;
  formName: string;
  assessments: AssessmentDataFetchedToAssessmentList[];
}) => {
  return (
    <div className={"flex max-h-full min-h-0 flex-col gap-5 p-5"}>
      <div className="flex max-h-64 gap-5 rounded-3xl bg-gray-300/30 p-3 text-white shadow-md">
        <div>
          <h3 className={"text-2xl font-semibold"}>
            {`Avaliações em andamento do formulário ${formName} em ${locationName}`}
          </h3>

          <AssessmentList
            locationId={locationId}
            formId={formId}
            assessments={assessments}
          />
        </div>

        <AssessmentCreation
          locationId={locationId}
          formId={formId}
          userId={userId}
        />
      </div>
    </div>
  );
};

export default AssessmentsClient;
export { type AssessmentDataFetchedToAssessmentList };
