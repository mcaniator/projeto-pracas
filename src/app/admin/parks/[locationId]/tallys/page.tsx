import TallyPage from "@/components/singleUse/admin/tallys/tallyListPage";
import { searchLocationNameById } from "@/serverActions/locationUtil";
import { searchTallysByLocationId } from "@/serverActions/tallyUtil";

const AdminRoot = async ({ params }: { params: { locationId: string } }) => {
  const tallys = await searchTallysByLocationId(parseInt(params.locationId));
  const locationName = await searchLocationNameById(
    parseInt(params.locationId),
  );

  return (
    <TallyPage
      locationId={params.locationId}
      locationName={locationName}
      tallys={tallys}
    ></TallyPage>
  );
};

export default AdminRoot;
