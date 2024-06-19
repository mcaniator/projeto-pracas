import { TallyInProgressPage } from "@/components/singleUse/admin/tallys/tallyInProgress/tallyInProgressPage";
import { fetchOngoingTallyById } from "@/serverActions/tallyUtil";
import { notFound } from "next/navigation";

const Page = async ({
  params,
}: {
  params: { currentTallyInProgress: string };
}) => {
  const tally = await fetchOngoingTallyById(
    Number(params.currentTallyInProgress),
  );
  if (tally) {
    return (
      <TallyInProgressPage
        tallyId={Number(params.currentTallyInProgress)}
        tally={tally}
      />
    );
  } else {
    return notFound();
  }
};

export default Page;
