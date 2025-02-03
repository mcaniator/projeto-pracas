import { validateRequest } from "@/lib/lucia";
import { fetchAssessmentsInProgresss } from "@/serverActions/assessmentUtil";
import { searchformNameById } from "@/serverActions/formUtil";
import { searchLocationNameById } from "@/serverActions/locationUtil";
import { IconCalendarClock, IconUser } from "@tabler/icons-react";
import { redirect } from "next/navigation";

import AssessmentCreation from "./assessmentCreation";
import { AssessmentList } from "./assessmentList";

interface AssessmentDataFetchedToAssessmentList {
  id: number;
  startDate: Date;
  user: {
    username: string;
  };
}

const AssessmentPage = async ({
  params,
}: {
  params: { locationId: string; selectedFormId: string };
}) => {
  const { user } = await validateRequest();
  if (user === null || user.type !== "ADMIN") redirect("/error");

  const locationId = Number(params.locationId);
  const formId = Number(params.selectedFormId);
  const assessments = await fetchAssessmentsInProgresss(locationId, formId);
  const locationName = await searchLocationNameById(Number(params.locationId));
  const formName =
    (await searchformNameById(Number(params.selectedFormId))) || "ERRO";
  return (
    <div className={"flex max-h-full min-h-0 flex-col gap-5"}>
      <div className="flex flex-col gap-5 rounded-3xl bg-gray-300/30 p-3 text-white shadow-md lg:flex-row">
        <div className="flex-1">
          <h3 className={"text-2xl font-semibold"}>
            {`Avaliações em andamento do formulário ${formName} em ${locationName}`}
          </h3>
          <div className="mt-3 flex">
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
          <div className="mt-2 overflow-auto rounded">
            <AssessmentList
              locationId={locationId}
              formId={formId}
              formName={formName}
              assessments={assessments}
            />
          </div>
        </div>

        <div className="mt-5 lg:ml-5 lg:mt-0">
          <AssessmentCreation
            locationId={locationId}
            formId={formId}
            userId={user.id}
          />
        </div>
      </div>
    </div>
  );
};

export default AssessmentPage;

export { type AssessmentDataFetchedToAssessmentList };
