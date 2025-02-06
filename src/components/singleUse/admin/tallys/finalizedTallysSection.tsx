"use client";

import { IconCalendarClock, IconUser } from "@tabler/icons-react";

import { TallyFilter } from "./tallyFilter";
import { TallyList } from "./tallyList";
import { TallyDataFetchedToTallyList } from "./tallyListPage";

const FinalizedTallysSection = ({
  locationId,
  locationName,
  activeTallys,
  isMobileView,
  handleInitialDateChange,
  handleFinalDateChange,
  handleWeekdayChange,
}: {
  locationId: string;
  locationName: string;
  userId: string;
  activeTallys: TallyDataFetchedToTallyList[] | undefined;
  isMobileView: boolean;
  handleInitialDateChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleFinalDateChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleWeekdayChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) => {
  return (
    <div
      className={`flex gap-5 overflow-auto rounded-3xl bg-gray-300/30 p-3 text-white shadow-md ${isMobileView && "flex-col items-center"}`}
    >
      {!isMobileView && (
        <>
          <div
            className={`flex ${isMobileView ? "w-full" : "basis-3/5 overflow-auto"} flex-col gap-1`}
          >
            <h3 className={"text-lg font-semibold lg:text-2xl"}>
              {`Contagens finalizadas de ${locationName}`}
            </h3>
            {!activeTallys || activeTallys.length === 0 ?
              <h3>Nenhuma contagem finalizada para este local!</h3>
            : <>
                <div className="flex">
                  <span>
                    <h3 className="text-xl font-semibold">
                      <IconCalendarClock />
                    </h3>
                  </span>
                  <span className="ml-auto">
                    <h3 className="text-xl font-semibold">
                      <IconUser />
                    </h3>
                  </span>
                </div>
                <div className="overflow-auto rounded">
                  <TallyList
                    params={{ locationId: locationId }}
                    activeTallys={activeTallys}
                  />
                </div>
              </>
            }
          </div>

          <div
            className={`flex h-fit ${isMobileView ? "w-full" : "w-fit"} flex-col flex-wrap gap-1 rounded-3xl bg-gray-400/20 p-3 text-white shadow-inner`}
          >
            <TallyFilter
              handleInitialDateChange={handleInitialDateChange}
              handleFinalDateChange={handleFinalDateChange}
              handleWeekdayChange={handleWeekdayChange}
              locationId={parseInt(locationId)}
              locationName={locationName}
              activeTallys={activeTallys}
            ></TallyFilter>
          </div>
        </>
      )}
      {isMobileView && (
        <>
          <h3 className={"text-lg font-semibold lg:text-2xl"}>
            {`Contagens finalizadas de ${locationName}`}
          </h3>
          <div
            className={`flex h-fit ${isMobileView ? "w-full" : "w-fit"} flex-col flex-wrap gap-1 rounded-3xl bg-gray-400/20 p-3 text-white shadow-inner`}
          >
            <TallyFilter
              handleInitialDateChange={handleInitialDateChange}
              handleFinalDateChange={handleFinalDateChange}
              handleWeekdayChange={handleWeekdayChange}
              locationId={parseInt(locationId)}
              locationName={locationName}
              activeTallys={activeTallys}
            ></TallyFilter>
          </div>
          <div
            className={`flex ${isMobileView ? "w-full" : "basis-3/5 overflow-auto"} flex-col gap-1`}
          >
            {!activeTallys || activeTallys.length === 0 ?
              <h3>Nenhuma contagem finalizada para este local!</h3>
            : <>
                <div className="flex">
                  <span>
                    <h3 className="text-xl font-semibold">
                      <IconCalendarClock />
                    </h3>
                  </span>
                  <span className="ml-auto">
                    <h3 className="text-xl font-semibold">
                      <IconUser />
                    </h3>
                  </span>
                </div>
                <div className="overflow-auto rounded">
                  <TallyList
                    params={{ locationId: locationId }}
                    activeTallys={activeTallys}
                  />
                </div>
              </>
            }
          </div>
        </>
      )}
    </div>
  );
};

export default FinalizedTallysSection;
