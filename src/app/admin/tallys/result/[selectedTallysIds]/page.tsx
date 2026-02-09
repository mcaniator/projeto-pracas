import { fetchFinalizedTallysToDataVisualization } from "@queries/tally";
import { notFound } from "next/navigation";

import { TallysDataPage } from "./TallysDataPage";

const Page = async (props: {
  params: Promise<{ selectedTallysIds: string }>;
}) => {
  const params = await props.params;
  const decodedActiveTallysString = params.selectedTallysIds;
  const tallysIds = decodedActiveTallysString.match(/\d+/g)?.map(Number);

  if (!tallysIds) {
    notFound();
  }
  const { tallys, locationName } =
    await fetchFinalizedTallysToDataVisualization(tallysIds);
  if (tallysIds.length === 0 || !tallys || tallys.length === 0) {
    notFound();
  } else {
    return (
      <TallysDataPage
        tallys={tallys}
        tallysIds={tallysIds}
        locationName={locationName}
      />
    );
  }
};

export default Page;
