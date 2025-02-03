import { validateRequest } from "@/lib/lucia";
import {
  fetchAssessmentGeometries,
  fetchAssessmentWithResponses,
} from "@/serverActions/assessmentUtil";
import { searchFormById } from "@/serverActions/formUtil";
import { searchLocationNameById } from "@/serverActions/locationUtil";
import { redirect } from "next/navigation";

import { ResponseComponent } from "./responseComponent";

const Responses = async ({
  params,
}: {
  params: {
    locationId: string;
    selectedFormId: string;
    selectedAssessmentId: string;
  };
}) => {
  const { user } = await validateRequest();
  if (user === null || user.type !== "ADMIN") redirect("/error");
  const locationName = await searchLocationNameById(
    parseInt(params.locationId),
  );
  const form = await searchFormById(parseInt(params.selectedFormId));

  const assessment = await fetchAssessmentWithResponses(
    Number(params.selectedAssessmentId),
  );
  const initialGeometries = await fetchAssessmentGeometries(
    Number(params.selectedAssessmentId),
  );
  if (assessment?.userId !== user.id) redirect("/error");
  return locationName == null ?
      <div>Localização não encontrada</div>
    : <div className="flex h-full flex-col gap-1 overflow-auto rounded-3xl bg-gray-300/30 p-3 text-white shadow-md">
        <h3 className="flex flex-col gap-5 text-2xl font-semibold">
          Avaliando: {locationName} com o formulário: {form?.name}
        </h3>
        {assessment?.formId !== null && assessment?.formId !== undefined ?
          <div className="h-full">
            <ResponseComponent
              assessment={assessment}
              userId={user.id}
              locationId={Number(params.locationId)}
              initialGeometries={initialGeometries}
            />
          </div>
        : <div className="text-redwood">
            Ainda não há perguntas no formulário
          </div>
        }
      </div>;
};
export default Responses;
