"use client";

import { TallyFilter } from "@/components/singleUse/admin/tallys/tallyFilter";
import { TallyList } from "@/components/singleUse/admin/tallys/tallyList";
import { tallyDataFetchedToTallyListType } from "@/lib/zodValidators";
import { useEffect, useState } from "react";

const weekdayFormatter = new Intl.DateTimeFormat("pt-BR", {
  timeZone: "America/Sao_Paulo",
  weekday: "short",
});
const TallyPage = ({
  locationId,
  locationName,
  tallys,
}: {
  locationId: string;
  locationName: string;
  tallys: tallyDataFetchedToTallyListType[];
}) => {
  const [initialDate, setInitialDate] = useState(0);
  const [finalDate, setFinalDate] = useState(0);
  const [weekdaysFilter, setWeekDaysFilter] = useState<string[]>([]);
  const [activeTallysIds, setActiveTallysIds] = useState(
    tallys.map((tally) => tally.id),
  );

  useEffect(() => {
    const filteredTallys = tallys.filter((tally) => {
      if (weekdaysFilter.length > 0) {
        if (
          !weekdaysFilter.includes(weekdayFormatter.format(tally.startDate))
        ) {
          return false;
        }
      }

      if (initialDate === 0 && finalDate === 0) {
        return true;
      } else if (initialDate === 0) {
        if (tally.startDate.getTime() <= finalDate) return true;
      } else if (finalDate === 0) {
        if (tally.startDate.getTime() >= initialDate) return true;
      } else {
        if (
          tally.startDate.getTime() >= initialDate &&
          tally.startDate.getTime() <= finalDate
        ) {
          return true;
        }
      }
    });
    setActiveTallysIds(filteredTallys.map((tally) => tally.id));
  }, [initialDate, finalDate, weekdaysFilter, tallys]);

  return (
    <div className={"flex max-h-[calc(100vh-5.5rem)] min-h-0 gap-5 p-5"}>
      <div
        className={
          "flex basis-3/5 flex-col gap-1 rounded-3xl bg-gray-300/30 p-3 text-white shadow-md"
        }
      >
        <h3 className={"text-2xl font-semibold"}>
          {`Lista de contagens de ${locationName}`}
        </h3>
        <div className="overflow-auto rounded">
          <TallyList
            params={{ locationId: locationId }}
            tallys={tallys}
            initialDate={initialDate}
            finalDate={finalDate}
            weekdaysFilter={weekdaysFilter}
          />
        </div>
      </div>

      <div>
        <div
          className={
            " flex basis-1/5 flex-col gap-1 rounded-3xl bg-gray-300/30 p-3 text-white shadow-md"
          }
        >
          <h3 className={"text-2xl font-semibold"}>Filtros</h3>
          <TallyFilter
            setInitialDate={setInitialDate}
            setFinalDate={setFinalDate}
            setWeekDaysFilter={setWeekDaysFilter}
            locationId={parseInt(locationId)}
            activeTallysIds={activeTallysIds}
          ></TallyFilter>
        </div>
      </div>
    </div>
  );
};

export default TallyPage;
