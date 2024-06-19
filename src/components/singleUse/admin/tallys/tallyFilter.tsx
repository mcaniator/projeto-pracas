"use client";

import { Button } from "@/components/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import React from "react";

import { TallyDataFetchedToTallyList } from "./tallyListPage";

const TallyFilter = ({
  initialDateFilter,
  finalDateFilter,
  weekdaysFilter,
  locationId,
  activeTallys,
  updateFilteredTallys,
}: {
  initialDateFilter: React.MutableRefObject<number>;
  finalDateFilter: React.MutableRefObject<number>;
  weekdaysFilter: React.MutableRefObject<string[]>;
  locationId: number;
  activeTallys: TallyDataFetchedToTallyList[] | undefined;
  updateFilteredTallys: () => void;
}) => {
  const handleInitialDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedDate = e.target.value;
    const millisecondsSinceEpoch =
      selectedDate ? new Date(selectedDate).getTime() : null;
    if (millisecondsSinceEpoch)
      initialDateFilter.current = millisecondsSinceEpoch;
    else initialDateFilter.current = 0;
    updateFilteredTallys();
  };
  const handleFinalDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedDate = e.target.value;
    const millisecondsSinceEpoch =
      selectedDate ? new Date(selectedDate).getTime() : null;
    if (millisecondsSinceEpoch)
      finalDateFilter.current = millisecondsSinceEpoch;
    else finalDateFilter.current = 0;
    updateFilteredTallys();
  };
  const handleWeekdayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked)
      weekdaysFilter.current = [...weekdaysFilter.current, e.target.value];
    else
      weekdaysFilter.current = weekdaysFilter.current.filter(
        (day) => day !== e.target.value,
      );
    updateFilteredTallys();
  };
  let activeTallysIdsString;
  if (activeTallys)
    activeTallysIdsString = `${activeTallys.map((tally) => tally.id).join("-")}`;
  return (
    <React.Fragment>
      <h4 className={"text-2xl font-semibold"}>Filtros</h4>
      <div className="flex flex-col gap-5">
        <div className="flex basis-1/5 flex-col">
          <h5 className="text-xl font-semibold">Filtro por data</h5>
          <div className="flex-cols-2 flex gap-6">
            <div className="flex flex-row items-center">
              <label htmlFor="initial-date" className="mr-2">
                De:
              </label>
              <Input
                id="initial-date"
                type="datetime-local"
                onChange={handleInitialDateChange}
              ></Input>
            </div>

            <div className="flex flex-row items-center">
              <label htmlFor="final-date" className="mr-2">
                A:
              </label>
              <Input
                id="final-date"
                type="datetime-local"
                onChange={handleFinalDateChange}
              ></Input>
            </div>
          </div>
        </div>
        <div className="flex basis-1/5 flex-col">
          <h5 className="text-xl font-semibold">Filtro por dia da semana</h5>
          <div className="flex gap-4">
            <div className="flex">
              <label htmlFor="sun" className="mr-1">
                Dom.
              </label>
              <Checkbox
                id="sun"
                value={"dom."}
                variant={"default"}
                onChange={handleWeekdayChange}
              />
            </div>
            <div className="flex">
              <label htmlFor="mon" className="mr-1">
                Seg.
              </label>
              <Checkbox
                id="mon"
                value={"seg."}
                onChange={handleWeekdayChange}
              />
            </div>

            <div className="flex">
              <label htmlFor="tue" className="mr-1">
                Ter.
              </label>
              <Checkbox
                id="tue"
                value={"ter."}
                onChange={handleWeekdayChange}
              />
            </div>

            <div className="flex">
              <label htmlFor="wed" className="mr-1">
                Qua.
              </label>
              <Checkbox
                id="wed"
                value={"qua."}
                onChange={handleWeekdayChange}
              />
            </div>

            <div className="flex">
              <label htmlFor="thu" className="mr-1">
                Qui.
              </label>
              <Checkbox
                id="thu"
                value={"qui."}
                onChange={handleWeekdayChange}
              />
            </div>

            <div className="flex">
              <label htmlFor="fri" className="mr-1">
                Sex.
              </label>
              <Checkbox
                id="fri"
                value={"sex."}
                onChange={handleWeekdayChange}
              />
            </div>

            <div className="flex">
              <label htmlFor="sat" className="mr-1">
                Sáb.
              </label>
              <Checkbox
                id="sat"
                value={"sáb."}
                onChange={handleWeekdayChange}
              />
            </div>
          </div>
        </div>
        <div className="flex basis-1/5 flex-col">
          <h5 className="text-xl font-semibold">Contagens Filtradas</h5>
          <div>
            <Button type="button">
              <Link
                href={`/admin/parks/${locationId}/tallys/dataVisualization/${activeTallysIdsString}`}
              >
                Dados somados
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};

export { TallyFilter };
