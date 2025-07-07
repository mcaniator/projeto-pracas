"use client";

import { TallyDataFetchedToTallyList } from "@customTypes/tallys/tallyList";
import {
  IconCalendarClock,
  IconClipboardTextFilled,
  IconFileCheck,
  IconUser,
} from "@tabler/icons-react";

import { Button } from "../../../../../components/button";
import { TallyCreation } from "./tallyCreation";
import { TallysInProgressList } from "./tallysInProgressList";

const TallysInProgressSection = ({
  locationId,
  locationName,
  userId,
  ongoingTallys,
  isMobileView,
  selectedScreen,
  setSelectedScreen,
}: {
  locationId: string;
  locationName: string;
  userId: string;
  ongoingTallys: TallyDataFetchedToTallyList[] | undefined;
  isMobileView: boolean;
  selectedScreen: "IN_PROGRESS" | "FINALIZED";
  setSelectedScreen: (
    value: React.SetStateAction<"IN_PROGRESS" | "FINALIZED">,
  ) => void;
}) => {
  return (
    <div
      className={`flex gap-5 overflow-auto rounded-3xl bg-gray-300/30 p-3 shadow-md ${isMobileView ? "flex-col items-center" : "max-h-[30vh]"}`}
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
                  className={`max-h-full w-full ${!isMobileView && "overflow-auto"} rounded`}
                >
                  <TallysInProgressList
                    params={{ locationId: locationId }}
                    activeTallys={ongoingTallys}
                  />
                </div>
              </>
            }
          </div>
          <div className="max-h-52 w-fit rounded-3xl bg-gray-400/20 p-3 shadow-inner">
            <TallyCreation locationId={locationId} userId={userId} />
          </div>
        </>
      )}
      {isMobileView && (
        <>
          <h3 className={"text-lg font-semibold lg:text-2xl"}>
            {`Contagens em ${locationName}`}
          </h3>
          <div className="my-1 inline-flex w-fit flex-row gap-1 rounded-xl bg-gray-400/20 py-1 shadow-inner">
            <Button
              variant={"ghost"}
              onPress={() => setSelectedScreen("IN_PROGRESS")}
              className={`rounded-xl px-4 py-1 ${selectedScreen === "IN_PROGRESS" ? "bg-gray-200/20 shadow-md" : "bg-gray-400/0 shadow-none"}`}
            >
              <IconClipboardTextFilled />
            </Button>
            <Button
              variant={"ghost"}
              onPress={() => setSelectedScreen("FINALIZED")}
              className={`rounded-xl px-4 py-1 ${selectedScreen === "FINALIZED" ? "bg-gray-200/20 shadow-md" : "bg-gray-400/0 shadow-none"}`}
            >
              <IconFileCheck />
            </Button>
          </div>
          <div className="max-h-52 w-fit rounded-3xl bg-gray-400/20 p-3 shadow-inner">
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
