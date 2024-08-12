"use client";

import Link from "next/link";

import { TallyDataFetchedToTallyList } from "./tallyListPage";

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
  id,
  startDate,
  observer,
  locationId,
}: {
  id: number;
  startDate: string;
  observer: string;
  locationId: string;
}) => {
  const startD = new Date(startDate);
  const weekday = weekdayFormatter.format(startD);
  return (
    <Link
      key={id}
      className="mb-2 flex items-center justify-between rounded bg-white p-2"
      href={`/admin/parks/${locationId}/tallys/dataVisualization/${id}`}
    >
      <span>{`${weekday.charAt(0).toUpperCase() + weekday.slice(1)}, ${dateWithHoursFormatter.format(startD)}`}</span>
      <span className="ml-auto">{observer}</span>
    </Link>
  );
};

const TallyList = ({
  params,
  activeTallys,
}: {
  params: { locationId: string };
  activeTallys: TallyDataFetchedToTallyList[];
}) => {
  return activeTallys === undefined || activeTallys.length === 0 ?
      <h3>Nenhuma contagem encontrada para este local!</h3>
    : <div className="w-full text-black">
        {activeTallys.map((tally) => (
          <TallyComponent
            key={tally.id}
            id={tally.id}
            startDate={tally.startDate.toString()}
            observer={tally.observer}
            locationId={params.locationId}
          />
        ))}
      </div>;
};

export { TallyList };
