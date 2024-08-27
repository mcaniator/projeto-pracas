import { fetchForms } from "@/serverActions/formUtil";

import { FormComponent } from "./formComponent";

const Evaluation = async ({ params }: { params: { locationId: string } }) => {
  const forms = await fetchForms();
  return (
    <div className={"flex max-h-full min-h-0 flex-col gap-5 p-5"}>
      <div className="flex max-h-64 flex-col gap-5 rounded-3xl bg-gray-300/30 p-3 text-white shadow-md">
        <h3 className="text-2xl font-semibold">
          Escolha o formulário para avaliar
        </h3>
        {forms.length > 0 ?
          <div className="w-full">
            {forms.map((form) => (
              <FormComponent
                key={form.id}
                formId={form.id}
                name={form.name}
                locationId={Number(params.locationId)}
                version={form.version}
              />
            ))}
          </div>
        : <div className="text-redwood">
            Ainda não há perguntas no formulário
          </div>
        }
      </div>
    </div>
  );
};

export default Evaluation;
