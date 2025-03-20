import { ParkForm } from "@/app/admin/parks/parkForm";
import { prisma } from "@/lib/prisma";
import { IconCirclePlus } from "@tabler/icons-react";
import Link from "next/link";

const AdminRoot = async () => {
  const parkNames = await prisma.location.findMany({
    select: { id: true, name: true },
  });

  return (
    <div className={"flex h-full max-w-full flex-grow gap-5 overflow-auto"}>
      <div className="flex max-w-full basis-full flex-col gap-5 overflow-auto">
        <div
          className={
            "flex flex-col gap-1 overflow-auto rounded-3xl bg-gray-300/30 p-3 shadow-md"
          }
        >
          <h3 className={"text-2xl font-semibold"}>Locais</h3>
          <Link
            href={"/admin/parks/locationRegister"}
            className="flex w-fit items-center justify-center rounded-lg bg-emerald p-2 text-xl bg-blend-darken shadow-md transition-all duration-200 hover:bg-sea-green"
          >
            <IconCirclePlus />
          </Link>
          <ParkForm location={parkNames} />
        </div>
      </div>
    </div>
  );
};

export default AdminRoot;
