"use client";

import { Input } from "@/components/input";
import { search } from "@/lib/search";
import Fuse, { FuseResult } from "fuse.js";
import Link from "next/link";
import { useMemo, useState } from "react";

const LocationList = ({
  locations,
}: {
  locations: FuseResult<{ id: number; name: string }>[];
}) => {
  return (
    <>
      {locations.map((location, index) => (
        <Link
          className={`b w-full ${index % 2 === 0 ? "bg-gray-400/70" : "bg-gray-400/50"} p-2 text-white hover:bg-transparent/10 hover:underline`}
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
    <div className="flex h-full flex-col gap-4 overflow-auto py-1">
      <div className={"flex flex-col gap-2"}>
        <Input
          name="name"
          id={"name"}
          onChange={(value) => {
            setHay(search(value, sortedLocations, fuseHaystack));
          }}
        />
      </div>

      <div className="flex w-full flex-col overflow-y-scroll rounded-md text-white">
        <LocationList locations={hay} />
      </div>
    </div>
  );
};

export { ParkForm };
