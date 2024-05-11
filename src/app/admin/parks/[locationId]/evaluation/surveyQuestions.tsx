import { SurveyResponsesComponent } from "@/components/singleUse/admin/registration/forms/surveyResponsesComponent";
import { fetchFormsLatest } from "@/serverActions/formUtil";
import "@/serverActions/locationUtil";
import { Form, Location } from "@prisma/client";

const SurveyQuestions = async ({ location }: { location: Location }) => {
  const forms: Form[] = await fetchFormsLatest();

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
      : <div className="text-redwood">Ainda não há perguntas no formulário</div>
      }
    </div>
  );
};

export { SurveyQuestions };
