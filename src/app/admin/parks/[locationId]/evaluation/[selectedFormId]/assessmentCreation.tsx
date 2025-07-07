"use client";

import { Input } from "@/components/ui/input";
import { createAssessment } from "@/serverActions/assessmentUtil";
import LoadingIcon from "@components/LoadingIcon";
import { useHelperCard } from "@components/context/helperCardContext";
import { AssessmentCreationFormType } from "@customTypes/assessments/assessmentCreation";
import { useActionState, useEffect } from "react";

import { CreateAssessmentSubmitButton } from "./createAssessmentSubmitButton";

const AssessmentCreation = ({
  locationId,
  formId,
}: {
  locationId: number;
  formId: number;
}) => {
  const { setHelperCard } = useHelperCard();
  const currentDatetime = new Date();
  const [newAssessmentFormState, newAssessmentFormAction, isPending] =
    useActionState(createAssessment, {
      locationId: locationId.toString(),
      formId: formId.toString(),
      startDate: `${currentDatetime.getFullYear()}-${String(currentDatetime.getMonth() + 1).padStart(2, "0")}-${String(currentDatetime.getDate()).padStart(2, "0")}T${String(currentDatetime.getHours()).padStart(2, "0")}:${String(currentDatetime.getMinutes()).padStart(2, "0")}`,
      errors: {
        startDate: false,
      },
    } as AssessmentCreationFormType);
  useEffect(() => {
    if (newAssessmentFormState.statusCode === 201) {
      setHelperCard({
        show: true,
        helperCardType: "CONFIRM",
        content: <>Avaliação criada com sucesso!</>,
      });
    } else if (newAssessmentFormState.statusCode === 401) {
      setHelperCard({
        show: true,
        helperCardType: "ERROR",
        content: <>Sem permissão para criar avaliações!</>,
      });
    } else if (newAssessmentFormState.statusCode === 500) {
      setHelperCard({
        show: true,
        helperCardType: "ERROR",
        content: <>Erro ao criar avaliação!</>,
      });
    }
  }, [newAssessmentFormState, setHelperCard]);
  return (
    <div className="max-h-52 w-full rounded-3xl bg-gray-400/20 p-3 shadow-inner sm:w-fit">
      <h4 className={"text-2xl font-semibold"}>Criação de avaliações</h4>
      <div>
        <form action={newAssessmentFormAction} className="grid gap-3">
          <div className="flex flex-wrap items-center gap-1">
            <input type="hidden" name="formId" id="formId" value={formId} />
            <input
              type="hidden"
              name="locationId"
              value={locationId.toString()}
            />
          </div>
          <div className="flex flex-wrap gap-1">
            <label htmlFor="dateTime" className="mr-1">
              Data/horário:
            </label>

            <Input
              type="datetime-local"
              id="startDate"
              className={`${newAssessmentFormState.errors.startDate ? "outline" : ""} outline-2 outline-redwood`}
              name="startDate"
              defaultValue={newAssessmentFormState.startDate}
              required
            ></Input>
            {newAssessmentFormState && newAssessmentFormState.errors.startDate ?
              <div className="text-redwood">* Obrigatório</div>
            : ""}
          </div>
          <div className="">
            {isPending ?
              <div className="flex items-center justify-center">
                <LoadingIcon size={32} />
              </div>
            : <CreateAssessmentSubmitButton />}
          </div>
        </form>
      </div>
    </div>
  );
};

export default AssessmentCreation;
