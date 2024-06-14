import { fetchForms, fetchFormsLatest } from "@/serverActions/formUtil";
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
  const latestforms: Form[] = await fetchFormsLatest();
  const allForms: Form[] = await fetchForms();

  if (action === "evaluation") {
    return (
      <div>
        <div>Escolha o formulário para avaliar</div>
        {latestforms.length > 0 ?
          <div className="w-full">
            {latestforms.map((form) => (
              <FormSelectorClient
                key={form.id}
                selectedFormId={form.id}
                name={form.name}
                locationId={location.id}
                action={action}
              />
            ))}
            {/* <div>O valor de action em FormSelectorClient é: {action}</div> */}
          </div>
        : <div className="text-redwood">
            Ainda não há perguntas no formulário
          </div>
        }
      </div>
    );
  }
  return (
    <div>
      <div>Escolha o formulário para ver as respostas</div>
      {allForms.length > 0 ?
        <div className="w-full">
          {allForms.map((form) => (
            <FormSelectorClient
              key={form.id}
              selectedFormId={form.id}
              name={form.name}
              locationId={location.id}
              action={action}
              version={form.version}
            />
          ))}
          {/* <div>O valor de action em FormSelectorClient é: {action}</div> */}
        </div>
      : <div className="text-redwood">Ainda não há perguntas no formulário</div>
      }
    </div>
  );
};

export { FormSelector };
