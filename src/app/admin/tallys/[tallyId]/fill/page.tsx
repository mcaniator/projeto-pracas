import { fetchOngoingTallyById } from "@queries/tally";
import { notFound } from "next/navigation";

import { TallyInProgressPage } from "./tallyInProgressPage";

const Page = async (props: { params: Promise<{ tallyId: string }> }) => {
  const params = await props.params;
  const response = await fetchOngoingTallyById(Number(params.tallyId));
  const finalizedTally = !!response.tally?.endDate ?? false;
  if (response.tally) {
    return (
      <TallyInProgressPage
        tallyId={Number(params.tallyId)}
        locationId={Number(response.tally.location.id)}
        tally={response.tally}
        finalizedTally={finalizedTally}
      />
    );
  } else {
    return notFound();
  }
};

export default Page;
