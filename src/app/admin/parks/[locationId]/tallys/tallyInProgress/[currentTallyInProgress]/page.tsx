import { TallyInProgressPage } from "@/components/singleUse/admin/tallys/tallyInProgress/tallyInProgressPage";
import { fetchOngoingTallyById } from "@/serverActions/tallyUtil";
import { notFound } from "next/navigation";

const Page = async ({
  params,
}: {
  params: { locationId: string; currentTallyInProgress: string };
}) => {
  const tally = await fetchOngoingTallyById(
    Number(params.currentTallyInProgress),
  );
  if (tally) {
    return (
      <TallyInProgressPage
        tallyId={Number(params.currentTallyInProgress)}
        locationId={Number(params.locationId)}
        tally={tally}
      />
    );
  } else {
    return notFound();
  }
};

export default Page;
