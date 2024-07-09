"use client";

import { TallyDataFetchedToTallyList } from "@/components/singleUse/admin/tallys/tallyListPage";

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
}: {
  startDate: Date;
  observer: string;
  tallyId: number;
  checked: boolean;
  handleTallyChange(
    e: React.ChangeEvent<HTMLInputElement>,
    removeSaveState: boolean,
  ): void;
}) => {
  const weekday = weekdayFormatter.format(startDate);
  return (
    <div className="mb-2 flex items-center justify-between rounded bg-white p-2">
      <span className="flex flex-row">
        <input
          type="checkbox"
          value={tallyId}
          onChange={(e) => {
            handleTallyChange(e, true);
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
  tallys,
  selectedTallys,
  handleTallyChange,
}: {
  tallys: TallyDataFetchedToTallyList[];
  selectedTallys: number[];
  handleTallyChange(
    e: React.ChangeEvent<HTMLInputElement>,
    removeSaveState: boolean,
  ): void;
}) => {
  return tallys === undefined ?
      <h3>Nenhuma contagem para este local!</h3>
    : <div className="w-full overflow-auto text-black">
        {tallys.map((tally) => {
          const checked = selectedTallys?.includes(tally.id);
          return (
            <TallyComponent
              startDate={tally.startDate}
              observer={tally.observer}
              key={tally.id}
              tallyId={tally.id}
              checked={checked ? checked : false}
              handleTallyChange={handleTallyChange}
            />
          );
        })}
      </div>;
};

export { TallyList };
