import TallyPage from "@/components/singleUse/admin/tallys/tallyListPage";
import { searchLocationNameById } from "@/serverActions/locationUtil";
import { fetchTallysByLocationId } from "@/serverActions/tallyUtil";

const Tallys = async ({ params }: { params: { locationId: string } }) => {
  const tallys = await fetchTallysByLocationId(Number(params.locationId));
  const locationName = await searchLocationNameById(
    parseInt(params.locationId),
  );
  let endedTallys;
  let ongoingTallys;
  if (tallys) {
    endedTallys = tallys.filter((tally) => tally.endDate);
    ongoingTallys = tallys.filter((tally) => !tally.endDate);
  }

  return (
    <TallyPage
      locationId={params.locationId}
      locationName={locationName}
      tallys={endedTallys}
      ongoingTallys={ongoingTallys}
    ></TallyPage>
  );
};

export default Tallys;
