import { OngoingTallyPage } from "@/components/singleUse/admin/tallys/ongoingTally/ongoingTallyPage";
import { searchOngoingTallyById } from "@/serverActions/tallyUtil";

const Page = async ({
  params,
}: {
  params: { locationId: string; currentOngoingTally: string };
}) => {
  const tally = await searchOngoingTallyById(
    Number(params.currentOngoingTally),
  );
  return <OngoingTallyPage tally={tally}></OngoingTallyPage>;
};

export default Page;
