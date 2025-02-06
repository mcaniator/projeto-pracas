"use client";

import { IconCalendarClock, IconUser } from "@tabler/icons-react";

import { TallyCreation } from "./tallyCreation";
import { TallyDataFetchedToTallyList } from "./tallyListPage";
import { TallysInProgressList } from "./tallysInProgressList";

const TallysInProgressSection = ({
  locationId,
  locationName,
  userId,
  ongoingTallys,
  isMobileView,
}: {
  locationId: string;
  locationName: string;
  userId: string;
  ongoingTallys: TallyDataFetchedToTallyList[] | undefined;
  isMobileView: boolean;
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
              {`Contagens em andamento de ${locationName}`}
            </h3>
            {!ongoingTallys || ongoingTallys.length === 0 ?
              <h3>Nenhuma contagem em andamento para este local!</h3>
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
                <div
                  className={`w-full ${!isMobileView && "overflow-auto"} rounded`}
                >
                  <TallysInProgressList
                    params={{ locationId: locationId }}
                    activeTallys={ongoingTallys}
                  />
                </div>
              </>
            }
          </div>
          <div className="max-h-52 w-fit rounded-3xl bg-gray-400/20 p-3 text-white shadow-inner">
            <TallyCreation locationId={locationId} userId={userId} />
          </div>
        </>
      )}
      {isMobileView && (
        <>
          <h3 className={"text-lg font-semibold lg:text-2xl"}>
            {`Contagens em andamento de ${locationName}`}
          </h3>
          <div className="max-h-52 w-fit rounded-3xl bg-gray-400/20 p-3 text-white shadow-inner">
            <TallyCreation locationId={locationId} userId={userId} />
          </div>
          <div
            className={`flex ${isMobileView ? "w-full" : "basis-3/5 overflow-auto"} flex-col gap-1`}
          >
            {!ongoingTallys || ongoingTallys.length === 0 ?
              <h3>Nenhuma contagem em andamento para este local!</h3>
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
                <div
                  className={`w-full ${!isMobileView && "overflow-auto"} rounded`}
                >
                  <TallysInProgressList
                    params={{ locationId: locationId }}
                    activeTallys={ongoingTallys}
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

export default TallysInProgressSection;
