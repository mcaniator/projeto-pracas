"use client";

import { Tally } from "@prisma/client";
import Link from "next/link";

const weekdayFormatter = new Intl.DateTimeFormat("pt-BR", {
  timeZone: "America/Sao_Paulo",
  weekday: "short",
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
  return (
    <Link
      key={id}
      className="mb-2 flex items-center justify-between rounded bg-white p-2"
      href={`/admin/parks/${locationId}/tallys/${id}`}
    >
      <span>{`${weekdayFormatter.format(startD)}, ${startD.getDate()}/${startD.getMonth() + 1}/${startD.getFullYear()} - ${startD.getHours()}:${startD.getMinutes()}`}</span>
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
  tallys: Tally[];
  initialDate: number;
  finalDate: number;
  weekdaysFilter: string[];
}) => {
  return tallys === undefined || tallys.length === 0 ?
      <h3>Nenhuma contagem encontrada para este local!</h3>
    : <div className="w-full text-black">
        {tallys.length > 0 &&
          tallys
            .filter((tally) => {
              if (
                !weekdaysFilter.includes(
                  weekdayFormatter.format(tally.startDate),
                )
              ) {
                return false;
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
