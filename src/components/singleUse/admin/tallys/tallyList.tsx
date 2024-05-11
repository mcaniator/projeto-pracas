"use client";

import { Tally } from "@prisma/client";
import Link from "next/link";
import { string } from "zod";

const TallyComponent = ({
  id,
  startDate,
  observer,
  locationId,
}: {
  id: number;
  startDate: Date;
  observer: string;
  locationId: number;
}) => {
  return (
    <Link
      key={id}
      className="mb-2 flex items-center justify-between rounded bg-white p-2"
      href={`/admin/parks/${locationId}/tallys/${id}`}
    >
      {` | Observador: `}
    </Link>
  );
};

const TallyList = ({ tallysPromise }: { tallysPromise?: Tally[] }) => {
  if (!tallysPromise) return null;
  const tallys = tallysPromise;

  return tallys === undefined || tallys.length === 0 ?
      null
    : <div className="w-full text-black">
        {tallys.length > 0 &&
          tallys.map((tally) => (
            <TallyComponent
              key={tally.id}
              id={tally.id}
              startDate={tally.startDate}
              observer={tally.observer}
            />
          ))}
      </div>;
};

export { TallyList };
