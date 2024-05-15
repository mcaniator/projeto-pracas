"use client";

import { tallyDataFetchedToTallyListType } from "@/lib/zodValidators";
import Link from "next/link";

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
      href={`/admin/parks/${locationId}/tallys/${id}`}
    >
      <span>{`${weekday.charAt(0).toUpperCase() + weekday.slice(1)}, ${dateWithHoursFormatter.format(startD)}`}</span>
      <span className="ml-auto"> Observador(a): {observer}</span>
    </Link>
  );
};

const TallyList = ({
  params,
  tallys,
  initialDate,
  finalDate,
  weekdaysFilter,
}: {
  params: { locationId: string };
  tallys: tallyDataFetchedToTallyListType[];
  initialDate: number;
  finalDate: number;
  weekdaysFilter: string[];
}) => {
  return tallys === undefined || tallys.length === 0 ?
      <h3>Nenhuma contagem encontrada para este local!</h3>
    : <div className="w-full text-black">
        {tallys
          .filter((tally) => {
            if (weekdaysFilter.length > 0) {
              if (
                !weekdaysFilter.includes(
                  weekdayFormatter.format(tally.startDate),
                )
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
          })
          .map((tally) => (
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
