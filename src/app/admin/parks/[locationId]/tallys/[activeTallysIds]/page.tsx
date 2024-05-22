import { TallysDataPage } from "@/components/singleUse/admin/tallys/addedTallys/TallysDataPage";
import { prisma } from "@/lib/prisma";

const Page = async ({
  params,
}: {
  params: { locationId: string; activeTallysIds: string };
}) => {
  const decodedActiveTallysString = params.activeTallysIds;
  const tallysIds = decodedActiveTallysString.match(/\d+/g)?.map(Number);

  const location = await prisma.location.findUnique({
    where: {
      id: parseInt(params.locationId),
    },
    select: {
      name: true,
    },
  });
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

  return (
    <TallysDataPage
      locationName={location ? location.name : ""}
      tallys={tallys}
    />
  );
};

export default Page;
