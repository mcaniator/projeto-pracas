import { Button } from "@/components/button";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

const ParkInfo = async ({ id }: { id: number }) => {
  if (isNaN(id)) return null;

  const assessments = await prisma.assessment.findMany({
    where: { locationId: id },
    select: { id: true, endDate: true },
  });

  return (
    <div className="flex h-full flex-col text-white">
      <div className="flex max-h-[50%] basis-[50%] flex-col">
        <h3 className="text-2xl font-semibold">Formulários</h3>

        <div className="h-full overflow-scroll">
          {assessments.map((assessment, index) => {
            return (
              <div key={index}>
                <Link href={"/admin/assessments/" + id}>
                  <Button variant="ghost" className="w-full justify-start px-2">
                    <span className="-mb-1">
                      {
                        assessment.endDate.toLocaleString("pt-BR").split(",")[0] // this returns it formatted as dd/mm/yyyy without the timestamp
                      }
                    </span>
                  </Button>
                </Link>
              </div>
            );
          })}
        </div>
      </div>
      <div className="basis-[50%]">
        <h3 className="text-2xl font-semibold">Contagens</h3>
      </div>
    </div>
  );
};

export { ParkInfo };
