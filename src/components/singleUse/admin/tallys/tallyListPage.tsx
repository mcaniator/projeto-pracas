"use client";

import { TallyFilter } from "@/components/singleUse/admin/tallys/tallyFilter";
import { TallyList } from "@/components/singleUse/admin/tallys/tallyList";
import { Input } from "@/components/ui/input";
import { tallyDataFetchedToTallyListType } from "@/lib/zodValidators";
import { FormState, createTallyByUser } from "@/serverActions/tallyUtil";
import { useEffect, useRef, useState } from "react";
import React from "react";
import { useFormState } from "react-dom";

import { CreateTallySubmitButton } from "./createTallySubmitButton";
import { OngoingTallyList } from "./ongoingTallyList";

const weekdayFormatter = new Intl.DateTimeFormat("pt-BR", {
  timeZone: "America/Sao_Paulo",
  weekday: "short",
});
const currentDatetime = new Date();
const TallyPage = ({
  locationId,
  locationName,
  tallys,
  ongoingTallys,
}: {
  locationId: string;
  locationName: string;
  tallys: tallyDataFetchedToTallyListType[];
  ongoingTallys: tallyDataFetchedToTallyListType[];
}) => {
  const [initialDate, setInitialDate] = useState(0);
  const [finalDate, setFinalDate] = useState(0);
  const [weekdaysFilter, setWeekDaysFilter] = useState<string[]>([]);
  const [activeTallys, setActiveTallys] = useState(tallys);
  const [newTallyFormState, newTallyFormAction] = useFormState(
    createTallyByUser,
    {
      locationId: locationId,
      observer: "",
      date: `${currentDatetime.getFullYear()}-${String(currentDatetime.getMonth() + 1).padStart(2, "0")}-${String(currentDatetime.getDate()).padStart(2, "0")}T${String(currentDatetime.getHours()).padStart(2, "0")}:${String(currentDatetime.getMinutes()).padStart(2, "0")}`,
      errors: {
        observer: false,
        date: false,
      },
    } as FormState,
  );

  useEffect(() => {
    const filteredTallys = tallys.filter((tally) => {
      if (weekdaysFilter.length > 0) {
        if (
          !weekdaysFilter.includes(weekdayFormatter.format(tally.startDate))
        ) {
          return false;
        }
      }

      if (initialDate === 0 && finalDate === 0) {
        return true;
      } else if (initialDate === 0) {
        if (tally.startDate.getTime() <= finalDate) return true;
      } else if (finalDate === 0) {
        if (tally.startDate.getTime() >= initialDate) return true;
      } else {
        if (
          tally.startDate.getTime() >= initialDate &&
          tally.startDate.getTime() <= finalDate
        ) {
          return true;
        }
      }
    });
    setActiveTallys(filteredTallys);
  }, [initialDate, finalDate, weekdaysFilter, tallys]);
  /*useEffect(() => {
    formRef.current?.reset();
  }, [newTallyFormState]);*/
  const formRef = useRef<HTMLFormElement>(null);
  return (
    <div
      className={"flex max-h-[calc(100vh-5.5rem)] min-h-0 flex-col gap-5 p-5"}
    >
      <div className=" flex max-h-64 gap-5 ">
        <div
          className={
            "flex basis-3/5 flex-col gap-1 overflow-auto rounded-3xl bg-gray-300/30 p-3 text-white shadow-md"
          }
        >
          <h3 className={"text-2xl font-semibold"}>
            {`Lista de contagens em andamento de ${locationName}`}
          </h3>
          {!ongoingTallys || ongoingTallys.length === 0 ?
            <h3>Nenhuma contagem em andamento para este local!</h3>
          : <React.Fragment>
              <div className="flex">
                <span>
                  <h3 className="text-xl font-semibold">Data</h3>
                </span>
                <span className="ml-auto">
                  <h3 className="text-xl font-semibold">{"Observador(a)"}</h3>
                </span>
              </div>
              <div className="overflow-auto rounded">
                <OngoingTallyList
                  params={{ locationId: locationId }}
                  activeTallys={ongoingTallys}
                />
              </div>
            </React.Fragment>
          }
        </div>
        <div
          style={{ minWidth: "33.0625rem", width: "33.0625rem" }}
          className={
            " flex  flex-col gap-3 rounded-3xl bg-gray-300/30 p-3 text-white shadow-md"
          }
        >
          <h3 className={"text-2xl font-semibold"}>Criação de contagens</h3>
          <div>
            <form
              action={newTallyFormAction}
              ref={formRef}
              className="grid gap-3"
            >
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

                <Input
                  type="hidden"
                  name="locationId"
                  value={locationId}
                ></Input>
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
        </div>
      </div>
      <div className=" flex gap-5 overflow-auto">
        <div
          className={
            "flex basis-3/5 flex-col gap-1 rounded-3xl bg-gray-300/30 p-3 text-white shadow-md"
          }
        >
          <h3 className={"text-2xl font-semibold"}>
            {`Lista de contagens finalizadas de ${locationName}`}
          </h3>
          {!activeTallys || activeTallys.length === 0 ?
            <h3>Nenhuma contagem finalizada para este local!</h3>
          : <React.Fragment>
              <div className="flex">
                <span>
                  <h3 className="text-xl font-semibold">Data</h3>
                </span>
                <span className="ml-auto">
                  <h3 className="text-xl font-semibold">{"Observador(a)"}</h3>
                </span>
              </div>
              <div className="overflow-auto rounded">
                <TallyList
                  params={{ locationId: locationId }}
                  activeTallys={activeTallys}
                />
              </div>
            </React.Fragment>
          }
        </div>

        <div>
          <div
            className={
              " flex flex-col gap-1 rounded-3xl bg-gray-300/30 p-3 text-white shadow-md"
            }
          >
            <h3 className={"text-2xl font-semibold"}>Filtros</h3>
            <TallyFilter
              setInitialDate={setInitialDate}
              setFinalDate={setFinalDate}
              setWeekDaysFilter={setWeekDaysFilter}
              locationId={parseInt(locationId)}
              activeTallys={activeTallys}
            ></TallyFilter>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TallyPage;
