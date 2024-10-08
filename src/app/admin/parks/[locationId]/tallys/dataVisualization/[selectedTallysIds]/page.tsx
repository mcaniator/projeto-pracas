import { TallysDataPage } from "@/components/singleUse/admin/tallys/tallyDataVisualization/TallysDataPage";
import { searchLocationNameById } from "@/serverActions/locationUtil";
import { fetchFinalizedTallysToDataVisualization } from "@/serverActions/tallyUtil";
import { notFound } from "next/navigation";

const Page = async ({
  params,
}: {
  params: { locationId: string; selectedTallysIds: string };
}) => {
  const decodedActiveTallysString = params.selectedTallysIds;
  const tallysIds = decodedActiveTallysString.match(/\d+/g)?.map(Number);

  const locationName = await searchLocationNameById(Number(params.locationId));
  let tallys;
  if (tallysIds)
    tallys = await fetchFinalizedTallysToDataVisualization(tallysIds);
  if (!tallysIds || tallysIds.length === 0 || !tallys || tallys.length === 0) {
    notFound();
  } else {
    return (
      <TallysDataPage
        locationName={locationName}
        locationId={Number(params.locationId)}
        tallys={tallys}
        tallysIds={tallysIds}
      />
    );
  }
};

export default Page;
