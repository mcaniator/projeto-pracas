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
}: {
  startDate: Date;
  observer: string;
}) => {
  const weekday = weekdayFormatter.format(startDate);
  return (
    <div className="mb-2 flex items-center justify-between rounded bg-white p-2">
      <span className="flex flex-row">
        <input type="checkbox" />
        {`${weekday.charAt(0).toUpperCase() + weekday.slice(1)}, ${dateWithHoursFormatter.format(startDate)}`}
      </span>
      <span className="ml-auto">{observer}</span>
    </div>
  );
};

const TallyList = ({ tallys }: { tallys: TallyDataFetchedToTallyList[] }) => {
  return tallys === undefined ?
      <h3>Nenhuma contagem para este local!</h3>
    : <div className="w-full overflow-auto text-black">
        {tallys.map((tally) => (
          <TallyComponent
            startDate={tally.startDate}
            observer={tally.observer}
            key={tally.id}
          />
        ))}
      </div>;
};

export { TallyList };
