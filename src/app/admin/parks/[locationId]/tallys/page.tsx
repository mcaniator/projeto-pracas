import TallyPage from "@/components/singleUse/admin/tallys/tallyListPage";
import { searchLocationNameById } from "@/serverActions/locationUtil";
import { fetchTallysByLocationId } from "@/serverActions/tallyUtil";
import { redirect } from "next/navigation";

const Tallys = async (props: { params: Promise<{ locationId: string }> }) => {
  const params = await props.params;
  const tallys = await fetchTallysByLocationId(Number(params.locationId));
  const locationName = await searchLocationNameById(
    parseInt(params.locationId),
  );
  const user = null;
  if (user === null || user.type !== "ADMIN") redirect("/error");
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
      userId={user.id}
    />
  );
};

export default Tallys;
