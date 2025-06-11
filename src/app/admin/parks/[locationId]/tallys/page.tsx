import TallyPage from "@/components/singleUse/admin/tallys/tallyListPage";
import { searchLocationNameById } from "@/serverActions/locationUtil";
import { fetchTallysByLocationId } from "@/serverActions/tallyUtil";
import { redirect } from "next/navigation";

import { auth } from "../../../../../lib/auth/auth";

const Tallys = async (props: { params: Promise<{ locationId: string }> }) => {
  const session = await auth();
  if (!session?.user) redirect("/error");
  const params = await props.params;
  const { tallys } = await fetchTallysByLocationId(Number(params.locationId));
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
      userId={session?.user.id}
    />
  );
};

export default Tallys;
