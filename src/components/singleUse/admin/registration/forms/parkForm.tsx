"use client";

import { Input } from "@/components/input";
import { search } from "@/lib/search";
import { IconLink } from "@tabler/icons-react";
import Fuse, { FuseResult } from "fuse.js";
import Link from "next/link";
import { useState } from "react";

const LocationComponent = ({ id, name }: { id: number; name: string }) => {
  return (
    <Link
      key={id}
      className="mb-2 flex items-center justify-between rounded bg-white p-2"
      href={`/admin/parks/${id}`}
    >
      {name}
      <IconLink size={24} />
    </Link>
  );
};

const LocationList = ({
  locations,
}: {
  locations: FuseResult<{ id: number; name: string }>[];
}) => {
  return (
    <div className="w-full text-black">
      {locations.map((location, index) => (
        <LocationComponent
          key={index}
          id={location.item.id}
          name={location.item.name}
        />
      ))}
    </div>
  );
};

const ParkForm = ({
  location,
}: {
  location: { id: number; name: string }[];
}) => {
  const fuseHaystack = new Fuse(location, { keys: ["name"] });
  const [hay, setHay] = useState(search("", location, fuseHaystack));

  return (
    <>
      <div className={"flex flex-col gap-2"}>
        <label htmlFor={"name"}>Buscar pelo nome:</label>
        <Input
          type="text"
          name="name"
          id={"name"}
          autoComplete={"none"}
          onChange={(value) => {
            setHay(search(value, location, fuseHaystack));
          }}
        />
      </div>

      <LocationList locations={hay} />
    </>
  );
};

export { ParkForm };
