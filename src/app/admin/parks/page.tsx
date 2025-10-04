import { prisma } from "@/lib/prisma";
import PermissionGuard from "@components/auth/permissionGuard";
import { IconCirclePlus } from "@tabler/icons-react";
import Link from "next/link";

import { ParkForm } from "./parkForm";

const AdminRoot = async () => {
  const parkNames = await prisma.location.findMany({
    select: { id: true, name: true },
  });

  return (
    <div className={"flex justify-center h-full max-w-full flex-grow gap-5 overflow-auto bg-gradient-to-br from-cambridge-blue to-asparagus"}>
      <div className="flex w-1/2 flex-col gap-5 overflow-auto">
        <div
          className={
            "flex text-center flex-col gap-1 overflow-auto rounded-3xl bg-gray-300/20 p-3 shadow-md"
          }
        >
          <h3 className={"text-5xl font-semibold"}>Locais</h3>

          <ParkForm location={parkNames} />

          <PermissionGuard requiresAnyRoles={["PARK_MANAGER"]}>
            <Link
              href={"/admin/parks/locationRegister"}
              className="flex items-center justify-center border-none rounded-full bg-praca-green-dark p-2 text-xl bg-blend-darken shadow-md transition-all duration-200 hover:bg-praca-green-dark/85"
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
