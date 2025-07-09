"use client";

import { Button } from "@components/button";
import { TallyDataFetchedToTallyList } from "@customTypes/tallys/tallyList";
import {
  IconCalendarClock,
  IconClipboardTextFilled,
  IconFileCheck,
  IconUser,
} from "@tabler/icons-react";

import { TallyFilter } from "./tallyFilter";
import { TallyList } from "./tallyList";

const FinalizedTallysSection = ({
  locationId,
  locationName,
  activeTallys,
  isMobileView,
  selectedScreen,
  handleInitialDateChange,
  handleFinalDateChange,
  handleWeekdayChange,
  setSelectedScreen,
}: {
  locationId: string;
  locationName: string;
  userId: string;
  activeTallys: TallyDataFetchedToTallyList[] | undefined;
  isMobileView: boolean;
  selectedScreen: "IN_PROGRESS" | "FINALIZED";
  handleInitialDateChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleFinalDateChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleWeekdayChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  setSelectedScreen: (
    value: React.SetStateAction<"IN_PROGRESS" | "FINALIZED">,
  ) => void;
}) => {
  return (
    <div
      className={`flex gap-5 overflow-auto rounded-3xl bg-gray-300/30 p-3 shadow-md ${isMobileView && "flex-col items-center"}`}
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
            className={`flex h-fit ${isMobileView ? "w-full" : "w-fit"} flex-col flex-wrap gap-1 rounded-3xl bg-gray-400/20 p-3 shadow-inner`}
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

          <div
            className={`flex h-fit ${isMobileView ? "w-full" : "w-fit"} flex-col flex-wrap gap-1 rounded-3xl bg-gray-400/20 p-3 shadow-inner`}
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
