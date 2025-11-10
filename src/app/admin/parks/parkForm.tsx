"use client";

import { search } from "@/lib/search";
import { Input } from "@components/ui/input";
import Fuse, { FuseResult } from "fuse.js";
import Link from "next/link";
import { useMemo, useState } from "react";

const LocationList = ({
  locations,
}: {
  locations: FuseResult<{
    id: number;
    name: string;
    city: string;
    image: string;
  }>[];
}) => {
  /*locations = [
    {
      item: {
        id: 0,
        name: "Praça da Igreja",
        city: "Juiz de Fora",
        image: "/fotoPraca.jpg",
      },
      refIndex: 0,
    },
    {
      item: {
        id: 0,
        name: "Praça da Lajinha",
        city: "Juiz de Fora",
        image: "/fotoPraca.jpg",
      },
      refIndex: 0,
    },
    {
      item: {
        id: 0,
        name: "Pracinha São Pedro",
        city: "Juiz de Fora",
        image: "/fotoPraca.jpg",
      },
      refIndex: 0,
    },
    {
      item: {
        id: 0,
        name: "Jardim das Tulipas",
        city: "Juiz de Fora",
        image: "/fotoPraca.jpg",
      },
      refIndex: 0,
    },
  ];*/

  return (
    <>
      {locations.map((location, index) => (
        <Link
          className={`b flex h-auto w-full cursor-pointer flex-row gap-4 rounded-full bg-main p-2 pl-12 shadow-xl transition-transform duration-300 ease-in-out hover:scale-110`}
          key={index}
          href={`/admin/parks/${location.item.id}`}
        >
          <img
            src={location.item.image}
            className="h-14 w-14 rounded-full"
          ></img>
          <div>
            <p className="text-left text-2xl font-bold">{location.item.name}</p>
            <p className="text-l text-left font-semibold">
              {location.item.city}
            </p>
          </div>
        </Link>
      ))}
    </>
  );
};

const ParkForm = ({
  location,
}: {
  location: { id: number; name: string; city: string; image: string }[];
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
    <div className="mt-10 flex h-full flex-col items-center gap-4 py-1">
      <div className={"flex w-full flex-col items-center gap-2"}>
        <Input
          className="h-16 w-5/6 rounded-full border-none bg-stone-50 pl-12 text-xl font-semibold text-praca-green-dark"
          name="name"
          id={"name"}
          onChange={(e) => {
            setHay(search(e.target.value, sortedLocations, fuseHaystack));
          }}
        />
      </div>

      <div className="flex w-5/6 flex-col gap-4 rounded-md">
        <LocationList locations={hay} />
      </div>
    </div>
  );
};

export { ParkForm };
