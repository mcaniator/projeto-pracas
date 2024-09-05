import { validateRequest } from "@/lib/lucia";
import { fetchMultipleAssessmentsWithResponses } from "@/serverActions/assessmentUtil";
import { searchLocationNameById } from "@/serverActions/locationUtil";
import { redirect } from "next/navigation";

import { ResponseViewerClient } from "./responseViewerClient";

const ResponsesFetcher = async ({
  params,
}: {
  params: {
    locationId: string;
    selectedFormId: string;
    selectedAssessmentsIds: string;
  };
}) => {
  const { user } = await validateRequest();
  if (user === null || user.type !== "ADMIN") redirect("/error");
  const assessmentsIds: number[] = params.selectedAssessmentsIds
    .split("-")
    .map((id) => Number(id));
  const locationName = await searchLocationNameById(Number(params.locationId));
  const assessments =
    await fetchMultipleAssessmentsWithResponses(assessmentsIds);

  // TODO: add error handling
  return (
    <div>
      <h3 className="flex basis-3/5 flex-col gap-5 text-2xl font-semibold text-white">
        Respostas ao formulario {assessments[0]?.form.name} referentes a
        localidade {locationName}
      </h3>
      <div className="flex h-full flex-col gap-5 overflow-auto p-5 text-white">
        <ResponseViewerClient
          locationId={Number(params.locationId)}
          formId={Number(params.selectedFormId)}
          assessments={assessments}
        />
      </div>
    </div>
  );
};
export default ResponsesFetcher;
