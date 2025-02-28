"use client";

import { search } from "@/lib/search";
import Fuse, { FuseResult } from "fuse.js";
import Link from "next/link";
import { useMemo, useState } from "react";

import { Input } from "../../../../ui/input";

const LocationList = ({
  locations,
}: {
  locations: FuseResult<{ id: number; name: string }>[];
}) => {
  return (
    <>
      {locations.map((location, index) => (
        <Link
          className={`b w-full ${index % 2 === 0 ? "bg-gray-400/70" : "bg-gray-400/50"} p-2 hover:bg-transparent/10 hover:underline`}
          key={index}
          href={`/admin/parks/${location.item.id}`}
        >
          <p className="text-xl font-semibold">{location.item.name}</p>
        </Link>
      ))}
    </>
  );
};

const ParkForm = ({
  location,
}: {
  location: { id: number; name: string }[];
}) => {
  const sortedLocations = useMemo(
    () =>
      location.sort((a, b) => {
        if (a.name === b.name) return 0;
        else if (a.name > b.name) return 1;
        else return -1;
      }),
    [location],
  );

  const fuseHaystack = new Fuse(sortedLocations, { keys: ["name"] });
  const [hay, setHay] = useState(search("", sortedLocations, fuseHaystack));

  return (
    <div className="flex h-full flex-col gap-4 py-1">
      <h4 className="text-xl">Busca de locais</h4>
      <div className={"flex flex-col gap-2"}>
        <Input
          name="name"
          id={"name"}
          onChange={(e) => {
            setHay(search(e.target.value, sortedLocations, fuseHaystack));
          }}
        />
      </div>

      <div className="flex w-full flex-col rounded-md">
        <LocationList locations={hay} />
      </div>
    </div>
  );
};

export { ParkForm };
