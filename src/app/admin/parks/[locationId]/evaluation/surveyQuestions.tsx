"use client";

import { SurveyResponsesComponent } from "@/components/singleUse/admin/registration/forms/surveyResponsesComponent";
import { prisma } from "@/lib/prisma";
import "@/serverActions/locationUtil";
import { Form, Location } from "@prisma/client";

const SurveyQuestions = async ({ location }: { location: Location }) => {
  let forms: Form[];
  try {
    forms = await prisma.form.findMany();
  } catch (e) {
    // console.error(e);
    forms = [];
  }
  return (
    <div>
      <div>Escolha o formulário da avaliação</div>
      {/* <div>Clique no formulário para responder</div> */}
      {forms !== null ?
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
