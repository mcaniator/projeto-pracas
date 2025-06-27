import { ParkForm } from "@/app/admin/parks/parkForm";
import { prisma } from "@/lib/prisma";
import { IconPlus } from "@tabler/icons-react";

import PermissionGuard from "../../../components/auth/permissionGuard";
import ButtonLink from "../../../components/ui/buttonLink";

const AdminRoot = async () => {
  const parkNames = await prisma.location.findMany({
    select: { id: true, name: true },
  });

  return (
    <div className={"flex h-full max-w-full flex-grow gap-5 overflow-auto"}>
      <div className={"flex w-full flex-col gap-1 overflow-auto shadow-md"}>
        <div className="flex justify-between">
          <h3 className={"text-2xl font-semibold"}>Locais</h3>
          <PermissionGuard requiresAnyRoles={["PARK_MANAGER"]}>
            <ButtonLink href={"/admin/parks/locationRegister"}>
              <IconPlus />
              <span>Adicionar local</span>
            </ButtonLink>
          </PermissionGuard>
        </div>

        <ParkForm location={parkNames} />
      </div>
    </div>
  );
};

export default AdminRoot;
