"use client";

import { Input } from "@/components/ui/input";
import { searchLocationsByName } from "@/serverActions/locationUtil";
import { Form } from "@prisma/client";
import { IconLink } from "@tabler/icons-react";
import Link from "next/link";
import { Suspense, use, useDeferredValue, useEffect, useState } from "react";

const LocationComponent = ({ id, nome }: { id: number; nome: string }) => {
  return (
    <Link
      key={id}
      className="mb-2 flex items-center justify-between rounded bg-white p-2"
      href={`/admin/parks/${id}`}
    >
      {nome}
      <IconLink size={24} />
    </Link>
  );
};

const LocationList = ({
  locationsPromise,
}: {
  locationsPromise?: Promise<Form[]>;
}) => {
  if (locationsPromise === undefined) return null;
  const locations = use(locationsPromise);

  return locations === undefined || locations.length === 0 ?
      null
    : <div className="w-full text-black">
        {locations.length > 0 &&
          locations.map((location) => (
            <LocationComponent
              key={location.id}
              id={location.id}
              nome={location.name}
            />
          ))}
      </div>;
};

const ParkForm = () => {
  const [targetLocation, setTargetLocation] = useState("");

  const [foundLocations, setFoundLocations] = useState<Promise<Form[]>>();
  useEffect(() => {
    setFoundLocations(searchLocationsByName(targetLocation));
  }, [targetLocation]);

  const deferredFoundLocations = useDeferredValue(foundLocations);

  // TODO: add error handling
  return (
    <>
      <div className={"flex flex-col gap-2"}>
        <label htmlFor={"name"}>Buscar pelo nome:</label>
        <Input
          type="text"
          name="name"
          required
          id={"name"}
          autoComplete={"none"}
          value={targetLocation}
          onChange={(e) => setTargetLocation(e.target.value)}
        />
      </div>
      <Suspense>
        <LocationList locationsPromise={deferredFoundLocations} />
      </Suspense>
    </>
  );
};

export { ParkForm };
