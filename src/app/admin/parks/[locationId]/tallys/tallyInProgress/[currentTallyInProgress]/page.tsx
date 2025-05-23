import { TallyInProgressPage } from "@/components/singleUse/admin/tallys/tallyInProgress/tallyInProgressPage";
import { fetchOngoingTallyById } from "@/serverActions/tallyUtil";
import { notFound } from "next/navigation";
import { redirect } from "next/navigation";

import { auth } from "../../../../../../../lib/auth/auth";

const Page = async (props: {
  params: Promise<{ locationId: string; currentTallyInProgress: string }>;
}) => {
  const session = await auth();
  const params = await props.params;
  const user = session?.user;
  if (!user) redirect("/error");
  const tally = await fetchOngoingTallyById(
    Number(params.currentTallyInProgress),
  );
  if (tally) {
    return (
      <TallyInProgressPage
        userId={user?.id}
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
