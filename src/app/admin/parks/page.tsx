import { ParkForm } from "@/components/singleUse/admin/registration/forms/parkForm";
import { prisma } from "@/lib/prisma";

const AdminRoot = async () => {
  const parkNames = await prisma.location.findMany({
    select: { id: true, name: true },
  });

  return (
    <div className={"flex h-full max-w-full flex-grow gap-5 overflow-auto"}>
      <div className="flex max-w-full basis-full flex-col gap-5 overflow-auto text-white">
        <div
          className={
            "flex flex-col gap-1 overflow-auto rounded-3xl bg-gray-300/30 p-3 shadow-md"
          }
        >
          <h3 className={"text-2xl font-semibold"}>Busca de Locais</h3>
          <ParkForm location={parkNames} />
        </div>
      </div>
    </div>
  );
};

export default AdminRoot;
