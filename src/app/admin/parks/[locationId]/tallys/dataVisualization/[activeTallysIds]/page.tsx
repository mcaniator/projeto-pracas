import { TallysDataPage } from "@/components/singleUse/admin/tallys/tallyDataVisualization/TallysDataPage";
import { prisma } from "@/lib/prisma";
import { searchLocationNameById } from "@/serverActions/locationUtil";

const Page = async ({
  params,
}: {
  params: { locationId: string; activeTallysIds: string };
}) => {
  const decodedActiveTallysString = params.activeTallysIds;
  const tallysIds = decodedActiveTallysString.match(/\d+/g)?.map(Number);

  const locationName = await searchLocationNameById(Number(params.locationId));
  let tallys = await prisma.tally.findMany({
    where: {
      id: {
        in: tallysIds,
      },
    },
    include: {
      tallyPerson: {
        select: {
          quantity: true,
          person: {
            select: {
              ageGroup: true,
              gender: true,
              activity: true,
              isTraversing: true,
              isPersonWithImpairment: true,
              isInApparentIllicitActivity: true,
              isPersonWithoutHousing: true,
            },
          },
        },
      },
    },
  });
  tallys = tallys.filter((tally) => {
    if (tally.endDate) return true;
  });
  tallys.sort((a, b) => b.startDate.getTime() - a.startDate.getTime());

  if (tallysIds) {
    return (
      <TallysDataPage
        locationName={locationName}
        tallys={tallys}
        tallysIds={tallysIds}
        locationId={Number(params.locationId)}
      />
    );
  }
};

export default Page;
