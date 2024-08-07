import { ParkForm } from "@/components/singleUse/admin/registration/forms/parkForm";
import { prisma } from "@/lib/prisma";

const AdminRoot = async () => {
  const parkNames = await prisma.location.findMany({
    select: { id: true, name: true },
  });

  return (
    <div>
      <div className={"flex min-h-0 flex-grow gap-5 p-5"}>
        <div className="flex basis-3/5 flex-col gap-5 text-white">
          <div
            className={
              "flex basis-1/5 flex-col gap-1 rounded-3xl bg-gray-300/30 p-3 shadow-md"
            }
          >
            <h3 className={"text-2xl font-semibold"}>Busca de Locais</h3>
            <ParkForm location={parkNames} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminRoot;
