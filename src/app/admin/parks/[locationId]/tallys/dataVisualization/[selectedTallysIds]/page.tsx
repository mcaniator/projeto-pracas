import { searchLocationNameById } from "@serverActions/locationUtil";
import { fetchFinalizedTallysToDataVisualization } from "@serverActions/tallyUtil";
import { notFound } from "next/navigation";

import { TallysDataPage } from "./TallysDataPage";

const Page = async (props: {
  params: Promise<{ locationId: string; selectedTallysIds: string }>;
}) => {
  const params = await props.params;
  const decodedActiveTallysString = params.selectedTallysIds;
  const tallysIds = decodedActiveTallysString.match(/\d+/g)?.map(Number);

  const { locationName } = await searchLocationNameById(
    Number(params.locationId),
  );
  if (!tallysIds) {
    notFound();
  }
  const { tallys } = await fetchFinalizedTallysToDataVisualization(tallysIds);
  if (tallysIds.length === 0 || !tallys || tallys.length === 0) {
    notFound();
  } else {
    return (
      <TallysDataPage
        locationName={locationName ?? "[ERRO]"}
        locationId={Number(params.locationId)}
        tallys={tallys}
        tallysIds={tallysIds}
      />
    );
  }
};

export default Page;
