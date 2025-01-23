import { validateRequest } from "@/lib/lucia";
import {
  fetchAssessmentsGeometries,
  fetchMultipleAssessmentsWithResponses,
} from "@/serverActions/assessmentUtil";
import { searchLocationNameById } from "@/serverActions/locationUtil";
import { redirect } from "next/navigation";

import { AssessmentsWithResponsesList } from "./assessmentsWithResponsesList";
import MainContainer from "./mainContainer";

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
    <div className="h-full overflow-auto rounded-3xl bg-gray-500 text-white">
      <h3 className="hidden p-2 text-xl font-semibold text-white md:text-2xl xl:flex">
        Respostas ao formulario {assessments[0]?.form.name} referentes a
        localidade {locationName}
      </h3>
      <div className="flex h-full w-full gap-1">
        <div className="flex w-full flex-row gap-5">
          <div className="flex w-full overflow-auto xl:basis-1/2">
            <MainContainer
              assessments={assessments}
              assessmentsGeometries={assessmentsGeometries}
            />
          </div>

          <div className="hidden h-full basis-1/2 flex-col gap-1 overflow-auto rounded-3xl bg-gray-300/30 p-3 shadow-md xl:flex">
            <AssessmentsWithResponsesList
              assessments={assessments}
              assessmentsGeometries={assessmentsGeometries}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
export default ResponsesFetcher;
