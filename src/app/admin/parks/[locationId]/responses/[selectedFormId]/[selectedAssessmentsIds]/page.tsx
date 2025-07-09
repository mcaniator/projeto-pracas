import { fetchMultipleAssessmentsWithResponses } from "@serverActions/assessmentUtil";
import { searchLocationNameById } from "@serverActions/locationUtil";

import { AssessmentsWithResponsesList } from "./assessmentsWithResponsesList";
import MainContainer from "./mainContainer";

const ResponsesFetcher = async (props: {
  params: Promise<{
    locationId: string;
    selectedFormId: string;
    selectedAssessmentsIds: string;
  }>;
}) => {
  const params = await props.params;

  const assessmentsIds: number[] = params.selectedAssessmentsIds
    .split("-")
    .map((id) => Number(id));
  const { locationName } = await searchLocationNameById(
    Number(params.locationId),
  );
  const assessments =
    await fetchMultipleAssessmentsWithResponses(assessmentsIds);
  assessments.assessments.sort(
    (a, b) => b.startDate.getTime() - a.startDate.getTime(),
  );

  // TODO: add error handling
  return (
    <div className="flex h-full flex-col rounded-3xl bg-gray-500">
      <div className="flex h-full flex-col">
        <h3 className="hidden p-2 text-xl font-semibold md:text-2xl xl:flex">
          Respostas ao formulario {assessments.assessments[0]?.form.name}{" "}
          referentes à localidade {locationName}
        </h3>

        <div className="flex h-full w-full gap-1 overflow-auto">
          <div className="flex w-full flex-row gap-5">
            <div className="hidden h-full w-full flex-col gap-1 overflow-auto rounded-3xl bg-gray-300/30 p-3 shadow-md xl:flex xl:basis-1/2">
              <AssessmentsWithResponsesList assessments={assessments} />
            </div>

            <div className="h-full w-full flex-col gap-1 xl:basis-1/2">
              <MainContainer
                assessments={assessments}
                locationName={locationName ?? "[ERRO]"}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default ResponsesFetcher;
