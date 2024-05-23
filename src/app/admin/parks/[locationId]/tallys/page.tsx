import TallyPage from "@/components/singleUse/admin/tallys/tallyListPage";
import { searchLocationNameById } from "@/serverActions/locationUtil";
import { searchTallysByLocationId } from "@/serverActions/tallyUtil";

const AdminRoot = async ({ params }: { params: { locationId: string } }) => {
  const tallys = await searchTallysByLocationId(parseInt(params.locationId));
  const locationName = await searchLocationNameById(
    parseInt(params.locationId),
  );
  const endedTallys = tallys.filter((tally) => tally.endDate);
  const ongoingTallys = tallys.filter((tally) => !tally.endDate);
  return (
    <TallyPage
      locationId={params.locationId}
      locationName={locationName}
      tallys={endedTallys}
      ongoingTallys={ongoingTallys}
    ></TallyPage>
  );
};

export default AdminRoot;
