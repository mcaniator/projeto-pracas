import { fetchOngoingTallyById } from "@queries/tally";
import { notFound } from "next/navigation";

import { TallyInProgressPage } from "./tallyInProgressPage";

const Page = async (props: { params: Promise<{ tallyId: string }> }) => {
  const params = await props.params;
  const response = await fetchOngoingTallyById(Number(params.tallyId));
  if (response.tally) {
    return (
      <TallyInProgressPage
        tallyId={Number(params.tallyId)}
        locationId={Number(response.tally.location)}
        tally={response.tally}
      />
    );
  } else {
    return notFound();
  }
};

export default Page;
