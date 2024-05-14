import { TallyFilter } from "@/components/singleUse/admin/tallys/tallyFilter";
import { TallyList } from "@/components/singleUse/admin/tallys/tallyList";
import { searchLocationNameById } from "@/serverActions/locationUtil";
import { searchTallysByLocationId } from "@/serverActions/tallyUtil";

const AdminRoot = async ({ params }: { params: { locationId: string } }) => {
  const tallys = await searchTallysByLocationId(parseInt(params.locationId));
  const locationName = await searchLocationNameById(
    parseInt(params.locationId),
  );

  return (
    <div className={"flex min-h-0 flex-grow gap-5 p-5"}>
      <div className="flex basis-3/5 flex-col gap-5 text-white">
        <div
          className={
            "flex basis-1/5 flex-col gap-1 rounded-3xl bg-gray-300/30 p-3 shadow-md"
          }
        >
          <h3 className={"text-2xl font-semibold"}>
            {`Lista de contagens de ${locationName}`}
          </h3>

          <TallyList
            params={{ locationId: params.locationId }}
            tallysPromise={tallys}
          />
        </div>
      </div>
      <div className={"basis-2/5 rounded-3xl bg-gray-300/30 p-3 shadow-md"}>
        <div className="flex basis-3/5 flex-col gap-5 text-white">
          <h3 className={"text-2xl font-semibold"}>Filtro</h3>
          <TallyFilter></TallyFilter>
        </div>
      </div>
    </div>
  );
};

export default AdminRoot;
