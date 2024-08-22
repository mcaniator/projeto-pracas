import { TallyInProgressPage } from "@/components/singleUse/admin/tallys/tallyInProgress/tallyInProgressPage";
import { validateRequest } from "@/lib/lucia";
import { fetchOngoingTallyById } from "@/serverActions/tallyUtil";
import { notFound } from "next/navigation";
import { redirect } from "next/navigation";

const Page = async ({
  params,
}: {
  params: { locationId: string; currentTallyInProgress: string };
}) => {
  const { user } = await validateRequest();
  if (user === null || user.type !== "ADMIN") redirect("/error");
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
