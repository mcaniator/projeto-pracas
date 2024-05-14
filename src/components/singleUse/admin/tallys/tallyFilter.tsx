"use client";

import { Input } from "react-aria-components";

const TallyFilter = ({
  setInitialDate,
  setFinalDate,
  setWeekDaysFilter,
}: {
  setInitialDate: React.Dispatch<React.SetStateAction<number>>;
  setFinalDate: React.Dispatch<React.SetStateAction<number>>;
  setWeekDaysFilter: React.Dispatch<React.SetStateAction<string[]>>;
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
  return (
    <div className="flex  flex-col gap-5 text-white">
      <h3 className={"text-2xl font-semibold"}>Filtros</h3>
      <div className="flex basis-1/5 flex-col">
        <h3 className="text-xl font-semibold">Filtro por data</h3>
        <div className="flex-cols-2 flex gap-4">
          <div className="flex flex-row">
            <label htmlFor="initial-date" className="mr-2">
              De:
            </label>
            <Input
              id="initial-date"
              type="datetime-local"
              className={"text-black"}
              onChange={handleInitialDateChange}
            ></Input>
          </div>

          <div className="flex flex-row">
            <label htmlFor="final-date" className="mr-2">
              A:
            </label>
            <Input
              id="final-date"
              type="datetime-local"
              className={"text-black"}
              onChange={handleFinalDateChange}
            ></Input>
          </div>
        </div>
      </div>
      <div className="flex basis-1/5 flex-col">
        <h3 className="text-xl font-semibold">Filtro por dia da semana</h3>
        <div className="flex gap-4">
          <div className="flex items-center">
            <label htmlFor="sun" className="mr-1">
              Dom.
            </label>
            <Input
              id="sun"
              type="checkbox"
              value={"dom."}
              onChange={handleWeekdayChange}
              defaultChecked
            />
          </div>
          <div className="flex items-center">
            <label htmlFor="mon" className="mr-1">
              Seg.
            </label>
            <Input
              id="mon"
              type="checkbox"
              value={"seg."}
              onChange={handleWeekdayChange}
              defaultChecked
            />
          </div>

          <div className="flex items-center">
            <label htmlFor="tue" className="mr-1">
              Ter.
            </label>
            <Input
              id="tue"
              type="checkbox"
              value={"ter."}
              onChange={handleWeekdayChange}
              defaultChecked
            />
          </div>

          <div className="flex items-center">
            <label htmlFor="wed" className="mr-1">
              Qua.
            </label>
            <Input
              id="wed"
              type="checkbox"
              value={"qua."}
              onChange={handleWeekdayChange}
              defaultChecked
            />
          </div>

          <div className="flex items-center">
            <label htmlFor="thu" className="mr-1">
              Qui.
            </label>
            <Input
              id="thu"
              type="checkbox"
              value={"qui."}
              onChange={handleWeekdayChange}
              defaultChecked
            />
          </div>

          <div className="flex items-center">
            <label htmlFor="fri" className="mr-1">
              Sex.
            </label>
            <Input
              id="fri"
              type="checkbox"
              value={"sex."}
              onChange={handleWeekdayChange}
              defaultChecked
            />
          </div>

          <div className="flex items-center">
            <label htmlFor="sat" className="mr-1">
              Sáb.
            </label>
            <Input
              id="sat"
              type="checkbox"
              value={"sáb"}
              onChange={handleWeekdayChange}
              defaultChecked
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export { TallyFilter };
