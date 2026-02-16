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
  const { tallys, locationName, usableArea } =
    await fetchFinalizedTallysToDataVisualization(tallysIds);
  if (tallysIds.length === 0 || !tallys || tallys.length === 0) {
    notFound();
  } else {
    const complementaryData = tallys.reduce(
      (acc, val) => {
        acc.groups += val.groups || 0;
        acc.pets += val.animalsAmount || 0;
        return acc;
      },
      {
        groups: 0,
        pets: 0,
      },
    );
    return (
      <TallysDataPage
        tallys={tallys}
        complementaryData={complementaryData}
        locationName={locationName}
        locationUsableArea={usableArea}
      />
    );
  }
};

export default Page;
