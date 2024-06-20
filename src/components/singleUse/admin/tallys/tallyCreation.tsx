"use client";

import { Input } from "@/components/ui/input";
import { createTally } from "@/serverActions/tallyUtil";
import React, { useActionState } from "react";

import { CreateTallySubmitButton } from "./createTallySubmitButton";

type TallyCreationFormType = {
  locationId: string;
  observer: string;
  date: string;
  errors: {
    observer: boolean;
    date: boolean;
  };
};

const TallyCreation = ({ locationId }: { locationId: string }) => {
  const currentDatetime = new Date();
  const [newTallyFormState, newTallyFormAction] = useActionState(createTally, {
    locationId: locationId,
    observer: "",
    date: `${currentDatetime.getFullYear()}-${String(currentDatetime.getMonth() + 1).padStart(2, "0")}-${String(currentDatetime.getDate()).padStart(2, "0")}T${String(currentDatetime.getHours()).padStart(2, "0")}:${String(currentDatetime.getMinutes()).padStart(2, "0")}`,
    errors: {
      observer: false,
      date: false,
    },
  } as TallyCreationFormType);
  return (
    <React.Fragment>
      <h4 className={"text-2xl font-semibold"}>Criação de contagens</h4>
      <div>
        <form action={newTallyFormAction} className="grid gap-3">
          <div className="flex flex-row gap-1">
            <label htmlFor="obsever" className="mr-1">
              {"Observador(a):"}
            </label>
            <Input
              type="text"
              id="observer"
              name="observer"
              className={`${newTallyFormState.errors.observer ? "outline" : ""} outline-2 outline-red-500`}
              defaultValue={newTallyFormState.observer}
              required
            ></Input>

            {newTallyFormState.errors.observer ?
              <div className="text-red-500">* Obrigatório</div>
            : ""}

            <Input type="hidden" name="locationId" value={locationId}></Input>
          </div>
          <div className="flex flex-row gap-1">
            <label htmlFor="dateTime" className="mr-1">
              Data/horário:
            </label>

            <Input
              type="datetime-local"
              id="datetime"
              className={`${newTallyFormState.errors.date ? "outline" : ""} outline-2 outline-red-500`}
              name="date"
              defaultValue={newTallyFormState.date}
              required
            ></Input>
            {newTallyFormState.errors.date ?
              <div className="text-red-500">* Obrigatório</div>
            : ""}
          </div>
          <div className="flex flex-grow">
            <CreateTallySubmitButton />
          </div>
        </form>
      </div>
    </React.Fragment>
  );
};

export { TallyCreation };
export { type TallyCreationFormType };
