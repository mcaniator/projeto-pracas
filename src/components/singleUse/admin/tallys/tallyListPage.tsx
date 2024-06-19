"use client";

import { TallyFilter } from "@/components/singleUse/admin/tallys/tallyFilter";
import { TallyList } from "@/components/singleUse/admin/tallys/tallyList";
import { useRef, useState } from "react";
import React from "react";

import { OngoingTallyList } from "./ongoingTallyList";
import { TallyCreation } from "./tallyCreation";

interface TallyDataFetchedToTallyList {
  id: number;
  startDate: Date;
  endDate: Date | null;
  observer: string;
}
const weekdayFormatter = new Intl.DateTimeFormat("pt-BR", {
  timeZone: "America/Sao_Paulo",
  weekday: "short",
});

const TallyPage = ({
  locationId,
  locationName,
  tallys,
  ongoingTallys,
}: {
  locationId: string;
  locationName: string;
  tallys: TallyDataFetchedToTallyList[] | undefined;
  ongoingTallys: TallyDataFetchedToTallyList[] | undefined;
}) => {
  const weekdaysFilter = useRef<string[]>([]);
  const initialDateFilter = useRef(0);
  const finalDateFilter = useRef(0);
  const [activeTallys, setActiveTallys] = useState(tallys);

  const updateFilteredTallys = () => {
    if (!tallys) {
      return;
    }
    const filteredTallys = tallys.filter((tally) => {
      if (weekdaysFilter.current.length > 0) {
        if (
          !weekdaysFilter.current.includes(
            weekdayFormatter.format(tally.startDate),
          )
        ) {
          return false;
        }
      }

      if (initialDateFilter.current === 0 && finalDateFilter.current === 0) {
        return true;
      } else if (initialDateFilter.current === 0) {
        if (tally.startDate.getTime() <= finalDateFilter.current) return true;
      } else if (finalDateFilter.current === 0) {
        if (tally.startDate.getTime() >= initialDateFilter.current) return true;
      } else {
        if (
          tally.startDate.getTime() >= initialDateFilter.current &&
          tally.startDate.getTime() <= finalDateFilter.current
        ) {
          return true;
        }
      }
    });
    setActiveTallys(filteredTallys);
  };
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
          <TallyCreation locationId={locationId} />
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
              initialDateFilter={initialDateFilter}
              finalDateFilter={finalDateFilter}
              weekdaysFilter={weekdaysFilter}
              locationId={parseInt(locationId)}
              activeTallys={activeTallys}
              updateFilteredTallys={updateFilteredTallys}
            ></TallyFilter>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TallyPage;
export { type TallyDataFetchedToTallyList };
