"use client";

import { Tally } from "@prisma/client";
import Link from "next/link";

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
      <span>{`${startD.getDate()}/${startD.getMonth() + 1}/${startD.getFullYear()} - ${startD.getHours()}:${startD.getMinutes()}`}</span>
      <span className="ml-auto"> Observador(a): {observer}</span>
    </Link>
  );
};

const TallyList = ({
  params,
  tallysPromise,
}: {
  params: { locationId: string };
  tallysPromise?: Tally[];
}) => {
  const tallys = tallysPromise;

  return tallys === undefined || tallys.length === 0 ?
      <h3>Nenhuma contagem encontrada para este local!</h3>
    : <div className="w-full text-black">
        {tallys.length > 0 &&
          tallys.map((tally) => (
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
