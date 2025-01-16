import { validateRequest } from "@/lib/lucia";
import {
  fetchAssessmentsGeometries,
  fetchMultipleAssessmentsWithResponses,
} from "@/serverActions/assessmentUtil";
import { searchLocationNameById } from "@/serverActions/locationUtil";
import { redirect } from "next/navigation";

import { AssessmentsWithResponsesList } from "./assessmentsWithResponsesList";
import { FrequencyTable } from "./frequencyTable";

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
  assessments.sort((a, b) => b.startDate.getTime() - a.startDate.getTime());
  const assessmentsGeometries =
    await fetchAssessmentsGeometries(assessmentsIds);

  // TODO: add error handling
  return (
    <div className="h-full overflow-auto">
      <h3 className="flex basis-3/5 flex-col gap-5 text-2xl font-semibold text-white">
        Respostas ao formulario {assessments[0]?.form.name} referentes a
        localidade {locationName}
      </h3>
      <div className="flex h-full gap-5 overflow-auto text-white">
        <FrequencyTable assessments={assessments} />

        <AssessmentsWithResponsesList
          assessments={assessments}
          assessmentsGeometries={assessmentsGeometries}
        />
      </div>
    </div>
  );
};
export default ResponsesFetcher;
