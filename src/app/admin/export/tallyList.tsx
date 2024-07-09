"use client";

import { TallyDataFetchedToTallyList } from "@/components/singleUse/admin/tallys/tallyListPage";
import { useEffect, useState } from "react";

import { SelectedLocationObj } from "./client";

const weekdayFormatter = new Intl.DateTimeFormat("pt-BR", {
  timeZone: "America/Sao_Paulo",
  weekday: "short",
});
const dateWithHoursFormatter = new Intl.DateTimeFormat("pt-BR", {
  timeZone: "America/Sao_Paulo",
  day: "2-digit",
  month: "2-digit",
  year: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
});

const TallyComponent = ({
  startDate,
  observer,
  tallyId,
  checked,
  handleTallyChange,
  setCheckedTallys,
}: {
  startDate: Date;
  observer: string;
  tallyId: number;
  checked: boolean;
  handleTallyChange(e: React.ChangeEvent<HTMLInputElement>): void;
  setCheckedTallys: React.Dispatch<React.SetStateAction<number[]>>;
}) => {
  const weekday = weekdayFormatter.format(startDate);
  return (
    <div className="mb-2 flex items-center justify-between rounded bg-white p-2">
      <span className="flex flex-row">
        <input
          type="checkbox"
          value={tallyId}
          onChange={(e) => {
            if (e.target.checked) {
              setCheckedTallys((prev) => [...prev, Number(e.target.value)]);
            } else {
              setCheckedTallys((prev) =>
                prev.filter((tallyId) => tallyId !== Number(e.target.value)),
              );
            }
            handleTallyChange(e);
          }}
          checked={checked}
        />
        {`${weekday.charAt(0).toUpperCase() + weekday.slice(1)}, ${dateWithHoursFormatter.format(startDate)}`}
      </span>
      <span className="ml-auto">{observer}</span>
    </div>
  );
};

const TallyList = ({
  currentLocationId,
  selectedLocations,
  tallys,
  handleTallyChange,
}: {
  currentLocationId: number | undefined;
  selectedLocations: SelectedLocationObj[];
  tallys: TallyDataFetchedToTallyList[];
  handleTallyChange(e: React.ChangeEvent<HTMLInputElement>): void;
}) => {
  const [checkedTallys, setCheckedTallys] = useState<number[]>([]);

  useEffect(() => {
    const currentLocationObj = selectedLocations.find(
      (location) => location.id === currentLocationId,
    );
    setCheckedTallys(currentLocationObj?.tallysIds || []);
  }, [currentLocationId, selectedLocations]);
  return tallys === undefined ?
      <h3>Nenhuma contagem para este local!</h3>
    : <div className="w-full overflow-auto text-black">
        {tallys.map((tally) => {
          const checked = checkedTallys?.includes(tally.id);
          return (
            <TallyComponent
              startDate={tally.startDate}
              observer={tally.observer}
              key={tally.id}
              tallyId={tally.id}
              checked={checked ? checked : false}
              handleTallyChange={handleTallyChange}
              setCheckedTallys={setCheckedTallys}
            />
          );
        })}
      </div>;
};

export { TallyList };
