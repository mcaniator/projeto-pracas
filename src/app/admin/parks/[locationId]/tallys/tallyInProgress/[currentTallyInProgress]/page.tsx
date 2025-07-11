import { fetchOngoingTallyById } from "@/serverActions/tallyUtil";
import { notFound } from "next/navigation";

import { TallyInProgressPage } from "./tallyInProgressPage";

const Page = async (props: {
  params: Promise<{ locationId: string; currentTallyInProgress: string }>;
}) => {
  const params = await props.params;
  const { tally } = await fetchOngoingTallyById(
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
