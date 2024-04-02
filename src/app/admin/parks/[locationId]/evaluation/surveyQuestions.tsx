import { SurveyResponsesComponent } from "@/components/singleUse/admin/registration/forms/surveyResponsesComponent";
import { prisma } from "@/lib/prisma";
import "@/serverActions/locationUtil";
import { Form, Location } from "@prisma/client";

const SurveyQuestions = ({ location }: { location: Location }) => {
  let forms: Form[];
  return prisma.form
    .findMany()
    .then((foundForms) => {
      forms = foundForms;
      return (
        <div>
          <div>Escolha o formulário da avaliação</div>
          {forms.length > 0 ?
            <div className="w-full">
              {forms.map((form) => (
                <SurveyResponsesComponent
                  key={form.id}
                  selectedFormId={form.id}
                  name={form.name}
                  locationId={location.id}
                />
              ))}
            </div>
          : <div className="text-redwood">
              Ainda não há perguntas no formulário
            </div>
          }
        </div>
      );
    })
    .catch((error) => {
      console.error(error);
      forms = [];
      return <div className="text-redwood">Erro ao carregar formulários</div>;
    });
};

export { SurveyQuestions };
