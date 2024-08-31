import { validateRequest } from "@/lib/lucia";
import { fetchAssessmentsByLocationAndForm } from "@/serverActions/assessmentUtil";
import { searchFormsById } from "@/serverActions/formUtil";
import {
  searchLocationNameById,
  searchLocationsById,
} from "@/serverActions/locationUtil";
import { searchQuestionsByFormId } from "@/serverActions/questionSubmit";
import { redirect } from "next/navigation";

import { ResponseViewer } from "./responseViewer";

const ResponsesFetcher = async ({
  params,
}: {
  params: {
    locationId: string;
    selectedFormId: string;
  };
}) => {
  const { user } = await validateRequest();
  if (user === null || user.type !== "ADMIN") redirect("/error");
  const locationName = await searchLocationNameById(Number(params.locationId));
  const assessments = await fetchAssessmentsByLocationAndForm(
    Number(params.locationId),
    Number(params.selectedFormId),
  );

  // TODO: add error handling
  return (
    <div>
      <h3 className="flex basis-3/5 flex-col gap-5 text-2xl font-semibold text-white">
        Respostas ao formulario {} referentes a localidade {locationName}
      </h3>

      <ResponseViewer
        locationId={Number(params.locationId)}
        formId={Number(params.selectedFormId)}
        assessments={assessments}
      />
    </div>
  );
};
export default ResponsesFetcher;
