import { prisma } from "@/lib/prisma";
import PermissionGuard from "@components/auth/permissionGuard";
import { IconCirclePlus, IconLeaf, IconPlant2 } from "@tabler/icons-react";
import Link from "next/link";

import { ParkForm } from "./parkForm";

const AdminRoot = async () => {
  const parkNames = await prisma.location.findMany({
    select: { id: true, name: true },
  });

  return (
    <div className="flex h-[97vh] justify-center overflow-auto bg-gradient-to-br from-cambridge-blue to-asparagus">
      <div className="pointer-events-none absolute h-[97vh] w-full overflow-clip">
        <IconLeaf className="absolute h-96 w-96 -translate-x-28 translate-y-24 rotate-[20deg] stroke-1 text-seasick-green sm:h-[700px] sm:w-[700px] sm:-translate-x-40 sm:translate-y-12" />
        <IconPlant2 className="absolute bottom-0 right-0 h-96 w-96 translate-x-32 translate-y-24 -rotate-[35deg] stroke-1 text-seasick-green sm:h-[700px] sm:w-[700px] sm:translate-x-60 sm:translate-y-40" />
      </div>
      <div className="flex w-2/5 mt-28 flex-col gap-5 overflow-auto">
        <div className={"flex text-center flex-col gap-1 overflow-auto rounded-3xl p-3"}>
          <h3 className={"text-5xl font-semibold"}>Locais</h3>

          <ParkForm location={parkNames} />

          <PermissionGuard requiresAnyRoles={["PARK_MANAGER"]}>
            <Link
              href={"/admin/parks/locationRegister"}
              className="h-16 w-5/6 p-4 self-center flex items-center justify-center border-none rounded-full bg-praca-green-dark p-2 text-xl shadow-md transition-all duration-200 hover:scale-105"
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
