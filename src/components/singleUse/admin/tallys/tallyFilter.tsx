"use client";

import { Button } from "@/components/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import Link from "next/link";

import { TallyDataFetchedToTallyList } from "./tallyListPage";

const TallyFilter = ({
  setInitialDate,
  setFinalDate,
  setWeekDaysFilter,
  locationId,
  activeTallys,
}: {
  setInitialDate: React.Dispatch<React.SetStateAction<number>>;
  setFinalDate: React.Dispatch<React.SetStateAction<number>>;
  setWeekDaysFilter: React.Dispatch<React.SetStateAction<string[]>>;
  locationId: number;
  activeTallys: TallyDataFetchedToTallyList[] | undefined;
}) => {
  const handleInitialDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedDate = e.target.value;
    const millisecondsSinceEpoch =
      selectedDate ? new Date(selectedDate).getTime() : null;
    if (millisecondsSinceEpoch) setInitialDate(millisecondsSinceEpoch);
    else setInitialDate(0);
  };
  const handleFinalDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedDate = e.target.value;
    const millisecondsSinceEpoch =
      selectedDate ? new Date(selectedDate).getTime() : null;
    if (millisecondsSinceEpoch) setFinalDate(millisecondsSinceEpoch);
    else setFinalDate(0);
  };
  const handleWeekdayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked)
      setWeekDaysFilter((prev) => [...prev, e.target.value]);
    else
      setWeekDaysFilter((prev) => prev.filter((day) => day !== e.target.value));
  };
  let activeTallysIdsString;
  if (activeTallys)
    activeTallysIdsString = `${activeTallys.map((tally) => tally.id).join("-")}`;
  return (
    <div className="flex flex-col gap-5">
      <div className="flex basis-1/5 flex-col">
        <h3 className="text-xl font-semibold">Filtro por data</h3>
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
        <h3 className="text-xl font-semibold">Filtro por dia da semana</h3>
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
            <Checkbox id="mon" value={"seg."} onChange={handleWeekdayChange} />
          </div>

          <div className="flex">
            <label htmlFor="tue" className="mr-1">
              Ter.
            </label>
            <Checkbox id="tue" value={"ter."} onChange={handleWeekdayChange} />
          </div>

          <div className="flex">
            <label htmlFor="wed" className="mr-1">
              Qua.
            </label>
            <Checkbox id="wed" value={"qua."} onChange={handleWeekdayChange} />
          </div>

          <div className="flex">
            <label htmlFor="thu" className="mr-1">
              Qui.
            </label>
            <Checkbox id="thu" value={"qui."} onChange={handleWeekdayChange} />
          </div>

          <div className="flex">
            <label htmlFor="fri" className="mr-1">
              Sex.
            </label>
            <Checkbox id="fri" value={"sex."} onChange={handleWeekdayChange} />
          </div>

          <div className="flex">
            <label htmlFor="sat" className="mr-1">
              Sáb.
            </label>
            <Checkbox id="sat" value={"sáb."} onChange={handleWeekdayChange} />
          </div>
        </div>
      </div>
      <div className="flex basis-1/5 flex-col">
        <h3 className="text-xl font-semibold">Contagens Filtradas</h3>
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
  );
};

export { TallyFilter };
