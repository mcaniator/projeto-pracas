"use client";

import { TallyFilter } from "@/components/singleUse/admin/tallys/tallyFilter";
import { TallyList } from "@/components/singleUse/admin/tallys/tallyList";
import { Tally } from "@prisma/client";
import { useState } from "react";

const TallyPage = ({
  locationId,
  locationName,
  tallys,
}: {
  locationId: string;
  locationName: string;
  tallys: Tally[];
}) => {
  const [initialDate, setInitialDate] = useState(0);
  const [finalDate, setFinalDate] = useState(0);
  return (
    <div className={"flex min-h-0 flex-grow gap-5 p-5"}>
      <div className="flex basis-3/5 flex-col gap-5 text-white">
        <div
          className={
            "flex basis-1/5 flex-col gap-1 rounded-3xl bg-gray-300/30 p-3 shadow-md"
          }
        >
          <h3 className={"text-2xl font-semibold"}>
            {`Lista de contagens de ${locationName}`}
          </h3>

          <TallyList
            params={{ locationId: locationId }}
            tallysPromise={tallys}
            initialDate={initialDate}
            finalDate={finalDate}
          />
        </div>
      </div>
      <div className={"basis-2/5 rounded-3xl bg-gray-300/30 p-3 shadow-md"}>
        <div className="flex basis-3/5 flex-col gap-5 text-white">
          <h3 className={"text-2xl font-semibold"}>Filtro</h3>
          <TallyFilter
            setInitialDate={setInitialDate}
            setFinalDate={setFinalDate}
          ></TallyFilter>
        </div>
      </div>
    </div>
  );
};

export default TallyPage;
