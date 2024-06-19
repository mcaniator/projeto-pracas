import { OngoingTallyPage } from "@/components/singleUse/admin/tallys/ongoingTally/ongoingTallyPage";
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
      <OngoingTallyPage
        tallyId={Number(params.currentOngoingTally)}
        tally={tally}
      ></OngoingTallyPage>
    );
  } else {
    return notFound();
  }
};

export default Page;
