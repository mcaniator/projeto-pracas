import { TallyInProgressPage } from "@/components/singleUse/admin/tallys/tallyInProgress/tallyInProgressPage";
import { fetchOngoingTallyById } from "@/serverActions/tallyUtil";
import { notFound } from "next/navigation";

const Page = async ({
  params,
}: {
  params: { currentOngoingTally: string };
}) => {
  const tally = await fetchOngoingTallyById(Number(params.currentOngoingTally));
  if (tally) {
    return (
      <TallyInProgressPage
        tallyId={Number(params.currentOngoingTally)}
        tally={tally}
      />
    );
  } else {
    return notFound();
  }
};

export default Page;
