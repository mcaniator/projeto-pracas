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

const TallysInProgressList = ({
  params,
  activeTallys,
}: {
  params: { locationId: string };
  activeTallys: TallyDataFetchedToTallyList[];
}) => {
  return activeTallys === undefined || activeTallys.length === 0 ?
      <h3>Nenhuma contagem em andamento encontrada para este local!</h3>
    : <div className="w-full text-red-50">
        {activeTallys.map((tally, index) => {
          const weekday = weekdayFormatter.format(tally.startDate);
          return (
            <Link
              key={tally.id}
              className={`flex items-center justify-between ${index % 2 === 0 ? "bg-gray-400/70" : "bg-gray-400/50"} p-2 hover:bg-transparent/10 hover:underline`}
              href={`/admin/parks/${Number(params.locationId)}/tallys/tallyInProgress/${tally.id}`}
            >
              <span>{`${weekday.charAt(0).toUpperCase() + weekday.slice(1)}, ${dateWithHoursFormatter.format(tally.startDate)}`}</span>
              <span className="ml-auto">{tally.user.username}</span>
            </Link>
          );
        })}
      </div>;
};

export { TallysInProgressList };
