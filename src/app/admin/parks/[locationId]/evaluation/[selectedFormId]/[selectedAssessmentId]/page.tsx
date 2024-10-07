import { validateRequest } from "@/lib/lucia";
import { fetchAssessmentWithResponses } from "@/serverActions/assessmentUtil";
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
  if (assessment?.userId !== user.id) redirect("/error");
  // TODO: add error handling
  return locationName == null ?
      <div>Localização não encontrada</div>
    : <div>
        <h3 className="flex basis-3/5 flex-col gap-5 text-2xl font-semibold text-white">
          Avaliando: {locationName} com o formulário: {form?.name}
        </h3>
        {assessment?.formId !== null && assessment?.formId !== undefined ?
          <ul className="list-disc p-3">
            <ResponseComponent
              assessment={assessment}
              userId={user.id}
              locationId={Number(params.locationId)}
            />
          </ul>
        : <div className="text-redwood">
            Ainda não há perguntas no formulário
          </div>
        }
      </div>;
};
export default Responses;
