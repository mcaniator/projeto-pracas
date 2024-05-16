import { IndividualDataTable } from "@/components/singleUse/admin/tallys/addedTallys/individualDataTable";
import { prisma } from "@/lib/prisma";

const Page = async ({
  params,
}: {
  params: { locationId: string; activeTallysIds: string };
}) => {
  let validTallys = true;
  const decodedActiveTallysString = decodeURIComponent(params.activeTallysIds);
  const tallysIds = decodedActiveTallysString.match(/\d+/g)?.map(Number);
  if (tallysIds?.length === 0) validTallys = false;
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
  console.log(tallys);

  return (
    <div className="flex max-h-[calc(100vh-5.5rem)] min-h-0 gap-5 p-5">
      <div className="flex basis-3/5 flex-col gap-1 rounded-3xl bg-gray-300/30 p-3 text-white shadow-md">
        <h3 className="text-2xl font-semibold">{`Contagem realizada em ${location?.name}`}</h3>
        {decodedActiveTallysString}
      </div>
      <div className="col flex flex-col gap-1 rounded-3xl bg-gray-300/30 p-3 text-white shadow-md">
        <h3 className="text-2xl font-semibold">Dados sobre as contagens</h3>
        <div className="flex flex-row gap-5 overflow-auto">
          <IndividualDataTable tallys={tallys} />
        </div>
      </div>
    </div>
  );
};

export default Page;
