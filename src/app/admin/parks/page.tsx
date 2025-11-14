import { prisma } from "@/lib/prisma";
import PermissionGuard from "@components/auth/permissionGuard";
import { IconCirclePlus, IconLeaf, IconPlant2 } from "@tabler/icons-react";
import Link from "next/link";

import { ParkForm } from "./parkForm";

const AdminRoot = async () => {
  const parks = await prisma.location.findMany({
    select: {
      id: true,
      name: true,
      image: true,
      city: { select: { name: true } },
    },
  });

  return (
    <div className="flex h-[97vh] justify-center overflow-auto">
      <div className="pointer-events-none absolute h-[97vh] w-full overflow-clip">
        <IconLeaf className="absolute h-96 w-96 -translate-x-28 translate-y-24 rotate-[20deg] stroke-1 text-seasick-green sm:h-[700px] sm:w-[700px] sm:-translate-x-40 sm:translate-y-12" />
        <IconPlant2 className="absolute bottom-0 right-0 h-96 w-96 translate-x-32 translate-y-24 -rotate-[35deg] stroke-1 text-seasick-green sm:h-[700px] sm:w-[700px] sm:translate-x-60 sm:translate-y-40" />
      </div>
      <div className="mt-28 flex w-2/5 flex-col gap-5 overflow-auto">
        <div
          className={
            "flex flex-col gap-1 overflow-auto rounded-3xl p-3 text-center"
          }
        >
          <h3 className={"text-5xl font-semibold"}>Praças</h3>

          <ParkForm
            location={parks.map((p) => ({
              id: p.id,
              name: p.name,
              city: p.city ? p.city.name : "",
              image: p.image ?? "/fotoPraca.jpg",
            }))}
          />

          <PermissionGuard requiresAnyRoles={["PARK_MANAGER"]}>
            <Link
              href={"/admin/parks/locationRegister"}
              className="flex h-16 w-5/6 items-center justify-center self-center rounded-full border-none bg-praca-green-dark p-2 p-4 text-xl shadow-md transition-all duration-200 hover:scale-105"
            >
              <IconCirclePlus />
            </Link>
          </PermissionGuard>
        </div>
      </div>
    </div>
  );
};

export default AdminRoot;
