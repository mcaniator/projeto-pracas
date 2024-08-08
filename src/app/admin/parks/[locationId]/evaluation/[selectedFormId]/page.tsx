import { validateRequest } from "@/lib/lucia";
import { searchFormsById } from "@/serverActions/formUtil";
import { searchLocationsById } from "@/serverActions/locationUtil";
import { searchQuestionsByFormId } from "@/serverActions/questionSubmit";
import { redirect } from "next/navigation";

import { ResponseComponent } from "./responseComponent";

const Responses = async ({
  params,
}: {
  params: {
    locationId: string;
    selectedFormId: string;
  };
}) => {
  const { user } = await validateRequest();
  if (user === null || user.type !== "ADMIN") redirect("/error");
  const location = await searchLocationsById(parseInt(params.locationId));
  const form = await searchFormsById(parseInt(params.selectedFormId));
  const questions = await searchQuestionsByFormId(
    parseInt(params.selectedFormId),
  );

  // TODO: add error handling
  return location == null ?
      <div>Localização não encontrada</div>
    : <div>
        <h3 className="flex basis-3/5 flex-col gap-5 text-2xl font-semibold text-white">
          Avaliando: {location.name} com o formulário: {form?.name}
        </h3>
        {questions !== null && form !== null && form !== undefined ?
          <ul className="list-disc p-3">
            <ResponseComponent
              locationId={location.id}
              formId={form.id}
              formVersion={form.version}
              userId={user.id}
            />
          </ul>
        : <div className="text-redwood">
            Ainda não há perguntas no formulário
          </div>
        }
      </div>;
};
export default Responses;
