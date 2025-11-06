"use client";

import { search } from "@/lib/search";
import { Input } from "@components/ui/input";
import Fuse, { FuseResult } from "fuse.js";
import Link from "next/link";
import { useMemo, useState } from "react";

const LocationList = ({
  locations,
}: {
  locations: FuseResult<{ id: number; name: string; city: string; image: string }>[];
}) => {

  locations = [
    {
      item: { id: 0, name: "Praça da Igreja", city: "Juiz de Fora", image: "/fotoPraca.jpg"},
      refIndex: 0
    },
    {
      item: { id: 0, name: "Praça da Lajinha", city: "Juiz de Fora", image: "/fotoPraca.jpg" },
      refIndex: 0
    },
    {
      item: { id: 0, name: "Pracinha São Pedro", city: "Juiz de Fora", image: "/fotoPraca.jpg" },
      refIndex: 0
    },
    {
      item: { id: 0, name: "Jardim das Tulipas", city: "Juiz de Fora", image: "/fotoPraca.jpg" },
      refIndex: 0
    }
  ]

  return (
    <>
      {locations.map((location, index) => (
        <Link
          className={`b w-full h-auto flex flex-row gap-4 rounded-full bg-praca-green-lime p-2 pl-12 shadow-xl transition-transform duration-300 ease-in-out hover:scale-110 cursor-pointer`}
          key={index}
          href={`/admin/parks/${location.item.id}`}
        >
          <img src={location.item.image} className="h-14 w-14 rounded-full"></img>
          <div>
            <p className="text-left text-2xl font-bold">{location.item.name}</p>
            <p className="text-left text-l font-semibold">{location.item.city}</p>
          </div>
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
    <div className="flex mt-10 h-full flex-col gap-4 py-1 items-center">
      <div className={"flex flex-col w-full items-center gap-2"}>
        <Input 
          className="w-5/6 h-16 rounded-full bg-stone-50 border-none text-praca-green-dark text-xl font-semibold pl-12"
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
