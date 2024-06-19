import { searchFormsById } from "@/serverActions/formUtil";
import { searchLocationsById } from "@/serverActions/locationUtil";
import { searchQuestionsByFormId } from "@/serverActions/questionSubmit";

import { ResponseViewer } from "./responseViewer";

const ResponsesFetcher = async ({
  params,
}: {
  params: {
    locationId: string;
    selectedFormId: string;
  };
}) => {
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
          Respostas ao formulario {form?.name} referentes a localidade{" "}
          {location.name}
        </h3>
        {questions !== null && form !== null && form !== undefined ?
          <ul className="list-disc p-3 ">
            <ResponseViewer locationId={location.id} formId={form.id} />
          </ul>
        : <div className="text-redwood">
            Ainda não há perguntas no formulário
          </div>
        }
      </div>;
};
export default ResponsesFetcher;
