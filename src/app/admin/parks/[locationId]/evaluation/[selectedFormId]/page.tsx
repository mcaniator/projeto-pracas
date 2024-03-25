import { searchFormsById } from "@/serverActions/formUtil";
import { searchLocationsById } from "@/serverActions/locationUtil";
import { searchQuestionsByFormId } from "@/serverActions/questionSubmit";

import { ResponseComponent } from "./responseComponent";

const Responses = async ({
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
          Avaliando: {location.name} com o formulário: {form?.name}
        </h3>
        {questions !== null && form !== null && form !== undefined ?
          <ul className="list-disc p-3 ">
            {questions.map((question) => (
              <ResponseComponent
                key={question.id}
                locationId={location.id}
                formId={form.id}
                questionId={question.id}
                questionName={question.name}
              />
            ))}
            {/* {questions.map((question) => (
              <div key={question.id}>
                <div>a chave é: {question.id}</div>
                <div>o id do local é: {location.id}</div>
                <div>o id do formulário é: {form.id}</div>
                <div>o id da pergunta é: {question.id}</div>
                <div>o enunciado da pergunta é: {question.name}</div>
              </div>
            ))} */}
          </ul>
        : <div className="text-redwood">
            Ainda não há perguntas no formulário
          </div>
        }
      </div>;
};
export default Responses;
