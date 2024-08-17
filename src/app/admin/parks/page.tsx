import { ParkForm } from "@/components/singleUse/admin/registration/forms/parkForm";
import { prisma } from "@/lib/prisma";


import { ParkInfo } from "./parkInfo";

const AdminRoot = async ({
  searchParams,
}: {
  searchParams: { id: string };
}) => {
  const parkNames = await prisma.location.findMany({
    select: { id: true, name: true },
  });

  const selectedPark =
    searchParams.id === undefined ?
      undefined
    : parkNames.find((value) => {
        return value.id === parseInt(searchParams.id);
      });

  return (
    <div className="flex h-full w-full p-5">
      <div className="flex max-h-full w-full max-w-full">
        <div className="flex min-w-[70%] basis-[70%] flex-col gap-1 pr-3 text-white">
          <h2 className="-mb-1 text-3xl font-bold text-white">Praças</h2>

          <div className="flex max-h-full basis-full overflow-auto rounded-3xl bg-gray-300/30 p-3 shadow-md">
            <ParkForm location={parkNames} />
          </div>
        </div>
        <div className="flex h-full max-w-[30%] basis-[30%] flex-col gap-1 pl-2">
          <div className="max-w-full">
            <h2 className="-mb-1 overflow-hidden overflow-ellipsis whitespace-nowrap text-3xl font-bold text-white">
              {selectedPark === undefined ?
                `\u00A0` // this is a non-breaking space and prevents layout shifting
              : selectedPark.name}
            </h2>
          </div>

          <div className="h-full rounded-3xl bg-gray-300/30 p-3 shadow-md">
            <ParkInfo id={parseInt(searchParams.id)} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminRoot;
