"use client";

import { Input } from "@/components/ui/input";
import { createTally } from "@/serverActions/tallyUtil";
import React, { useActionState } from "react";

import { CreateTallySubmitButton } from "./createTallySubmitButton";

type TallyCreationFormType = {
  locationId: string;
  userId: string;
  date: string;
  errors: {
    userId: boolean;
    date: boolean;
  };
};

const TallyCreation = ({
  locationId,
  userId,
}: {
  locationId: string;
  userId: string;
}) => {
  const currentDatetime = new Date();
  const [newTallyFormState, newTallyFormAction] = useActionState(createTally, {
    locationId: locationId,
    userId: "",
    date: `${currentDatetime.getFullYear()}-${String(currentDatetime.getMonth() + 1).padStart(2, "0")}-${String(currentDatetime.getDate()).padStart(2, "0")}T${String(currentDatetime.getHours()).padStart(2, "0")}:${String(currentDatetime.getMinutes()).padStart(2, "0")}`,
    errors: {
      userId: false,
      date: false,
    },
  } as TallyCreationFormType);
  return (
    <>
      <h4 className={"text-2xl font-semibold"}>Criação de contagens</h4>
      <div>
        <form action={newTallyFormAction} className="grid gap-3">
          <div className="flex flex-row items-center gap-1">
            <Input
              type="hidden"
              id="userId"
              name="userId"
              className={`${newTallyFormState.errors.userId ? "outline" : ""} outline-2 outline-redwood`}
              defaultValue={userId}
              required
            />

            {newTallyFormState.errors.userId ?
              <span className="text-redwood">Obrigatório</span>
            : ""}

            <Input type="hidden" name="locationId" value={locationId} />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="dateTime" className="mr-1">
              Data/horário:
            </label>

            <Input
              type="datetime-local"
              id="datetime"
              className={`${newTallyFormState.errors.date ? "outline" : ""} outline-2 outline-redwood`}
              name="date"
              defaultValue={newTallyFormState.date}
              required
            ></Input>
            {newTallyFormState.errors.date ?
              <div className="text-redwood">* Obrigatório</div>
            : ""}
          </div>
          <div className="flex flex-grow">
            <CreateTallySubmitButton />
          </div>
        </form>
      </div>
    </>
  );
};

export { TallyCreation };
export { type TallyCreationFormType };
