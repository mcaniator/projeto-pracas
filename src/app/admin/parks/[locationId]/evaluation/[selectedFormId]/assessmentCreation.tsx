"use client";

import { Input } from "@/components/ui/input";
import { createAssessment } from "@/serverActions/assessmentUtil";
import { useActionState } from "react";

import { CreateAssessmentSubmitButton } from "./createAssessmentSubmitButton";

type AssessmentCreationFormType = {
  locationId: string;
  userId: string;
  formId: string;
  startDate: string;
  errors: {
    startDate: boolean;
  };
};

const AssessmentCreation = ({
  locationId,
  userId,
  formId,
}: {
  locationId: number;
  userId: string;
  formId: number;
}) => {
  const currentDatetime = new Date();
  const [newAssessmentFormState, newAssessmentFormAction] = useActionState(
    createAssessment,
    {
      locationId: locationId.toString(),
      userId,
      formId: formId.toString(),
      startDate: `${currentDatetime.getFullYear()}-${String(currentDatetime.getMonth() + 1).padStart(2, "0")}-${String(currentDatetime.getDate()).padStart(2, "0")}T${String(currentDatetime.getHours()).padStart(2, "0")}:${String(currentDatetime.getMinutes()).padStart(2, "0")}`,
      errors: {
        startDate: false,
      },
    } as AssessmentCreationFormType,
  );
  return (
    <div className="max-h-52 w-full rounded-3xl bg-gray-400/20 p-3 text-white shadow-inner sm:w-fit">
      <h4 className={"text-2xl font-semibold"}>Criação de avaliações</h4>
      <div>
        <form action={newAssessmentFormAction} className="grid gap-3">
          <div className="flex flex-row items-center gap-1">
            <input type="hidden" name="userId" id="userId" value={userId} />
            <input type="hidden" name="formId" id="formId" value={formId} />
            <Input
              type="hidden"
              name="locationId"
              value={locationId.toString()}
            ></Input>
          </div>
          <div className="flex flex-row gap-1">
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
          <div className="mx-auto flex flex-grow sm:ml-0">
            <CreateAssessmentSubmitButton />
          </div>
        </form>
      </div>
    </div>
  );
};

export default AssessmentCreation;
export { type AssessmentCreationFormType };
