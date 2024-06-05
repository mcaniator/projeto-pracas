import { fetchFormsLatest } from "@/serverActions/formUtil";
import "@/serverActions/locationUtil";
import { Form, Location } from "@prisma/client";

import { FormSelectorClient } from "./formSelectorClient";

const FormSelector = async ({
  location,
  action,
}: {
  location: Location;
  action?: string;
}) => {
  const forms: Form[] = await fetchFormsLatest();

  return (
    <div>
      <div>
        {action === "evaluate" ?
          "Escolha o formulário para avaliar"
        : "Escolha o formulário para ver as respostas"}
      </div>
      {forms.length > 0 ?
        <div className="w-full">
          {forms.map((form) => (
            <FormSelectorClient
              key={form.id}
              selectedFormId={form.id}
              name={form.name}
              locationId={location.id}
              action={action}
            />
          ))}
          <div>O valor de action em FormSelectorClient é: {action}</div>
        </div>
      : <div className="text-redwood">Ainda não há perguntas no formulário</div>
      }
    </div>
  );
};

export { FormSelector };
