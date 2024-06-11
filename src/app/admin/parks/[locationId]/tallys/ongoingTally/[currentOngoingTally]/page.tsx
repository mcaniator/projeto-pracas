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
  if (tally) {
    return (
      <OngoingTallyPage
        tallyId={Number(params.currentOngoingTally)}
        tally={tally}
      ></OngoingTallyPage>
    );
  } else {
    return (
      <div>
        <h3>Contagem Finalizada!</h3>
      </div>
    );
  }
};

export default Page;
