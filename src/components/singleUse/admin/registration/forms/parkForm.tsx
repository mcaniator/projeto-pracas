"use client";

import { Button } from "@/components/button";
import { Input } from "@/components/input";
import { search } from "@/lib/search";
import { IconListCheck, IconPencil, IconTrashX } from "@tabler/icons-react";
import Fuse, { FuseResult } from "fuse.js";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

const LocationComponent = ({ id, nome }: { id: number; nome: string }) => {
  const router = useRouter();

  return (
    <div className="flex gap-2 text-white">
      <div className="flex-1 overflow-hidden">
        <Link key={id} href={`/admin/parks/${id}`}>
          <Button
            variant={"ghost"}
            use={"link"}
            className="w-full justify-start px-2"
          >
            <span className="-mb-1 overflow-hidden overflow-ellipsis whitespace-nowrap text-[22px]/[30px] font-semibold">
              {nome}
            </span>
          </Button>
        </Link>
      </div>

      <div className="flex gap-2">
        <Button
          variant={"admin"}
          size={"icon"}
          onPress={() => {
            router.replace(`/admin/parks?id=${id}`);
          }}
        >
          <IconListCheck size={28} />
        </Button>

        <Button variant={"admin"} size={"icon"}>
          <IconPencil size={28} />
        </Button>
        <Button variant={"destructive"} size={"icon"}>
          <IconTrashX size={28} />
        </Button>
      </div>
    </div>
  );
};

const LocationList = ({
  locations,
}: {
  locations: FuseResult<{ id: number; name: string }>[];
}) => {
  return (
    <div className="grid w-full grid-cols-2 gap-2 text-black">
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
  const sortedLocations = useMemo(
    () =>
      location.toSorted((a, b) => {
        if (a.name === b.name) return 0;
        else if (a.name > b.name) return 1;
        else return -1;
      }),
    [location],
  );

  const fuseHaystack = new Fuse(sortedLocations, { keys: ["name"] });
  const [hay, setHay] = useState(search("", sortedLocations, fuseHaystack));

  return (
    <div className="flex h-full flex-col gap-4">
      <div className={"flex flex-col gap-2"}>
        <h3 className={"text-2xl font-semibold"}>Busca</h3>
        <Input
          name="name"
          id={"name"}
          onChange={(value) => {
            setHay(search(value, sortedLocations, fuseHaystack));
          }}
        />
      </div>

      <div className="overflow-y-scroll">
        <LocationList locations={hay} />
      </div>
    </div>
  );
};

export { ParkForm };
