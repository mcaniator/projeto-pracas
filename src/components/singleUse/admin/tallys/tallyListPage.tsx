"use client";

import { useEffect, useRef, useState } from "react";
import React from "react";

import TallysInProgressSection from "./TallysInProgressSection";
import FinalizedTallysSection from "./finalizedTallysSection";

interface TallyDataFetchedToTallyList {
  id: number;
  startDate: Date;
  endDate: Date | null;
  user: {
    username: string;
  };
}
type WeekdaysFilterItems =
  | "dom."
  | "seg."
  | "ter."
  | "qua."
  | "qui."
  | "sex."
  | "sáb.";
const weekdayFormatter = new Intl.DateTimeFormat("pt-BR", {
  timeZone: "America/Sao_Paulo",
  weekday: "short",
});

const TallyPage = ({
  locationId,
  locationName,
  tallys,
  ongoingTallys,
  userId,
}: {
  locationId: string;
  locationName: string;
  tallys: TallyDataFetchedToTallyList[] | undefined;
  ongoingTallys: TallyDataFetchedToTallyList[] | undefined;
  userId: string;
}) => {
  const [isMobileView, setIsMobileView] = useState(false);
  const [selectedScreen, setSelectedScreen] = useState<
    "IN_PROGRESS" | "FINALIZED"
  >("IN_PROGRESS");
  const weekdaysFilter = useRef<WeekdaysFilterItems[]>([]);
  const initialDateFilter = useRef(0);
  const finalDateFilter = useRef(0);
  const [activeTallys, setActiveTallys] = useState(tallys);

  const handleInitialDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedDate = e.target.value;
    const millisecondsSinceEpoch =
      selectedDate ? new Date(selectedDate).getTime() : null;
    if (millisecondsSinceEpoch)
      initialDateFilter.current = millisecondsSinceEpoch;
    else initialDateFilter.current = 0;
    updateFilteredTallys();
  };

  const handleFinalDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedDate = e.target.value;
    const millisecondsSinceEpoch =
      selectedDate ? new Date(selectedDate).getTime() : null;
    if (millisecondsSinceEpoch)
      finalDateFilter.current = millisecondsSinceEpoch;
    else finalDateFilter.current = 0;
    updateFilteredTallys();
  };

  const handleWeekdayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked)
      weekdaysFilter.current = [
        ...weekdaysFilter.current,
        e.target.value as WeekdaysFilterItems,
      ];
    else
      weekdaysFilter.current = weekdaysFilter.current.filter(
        (day) => day !== e.target.value,
      );
    updateFilteredTallys();
  };

  const updateFilteredTallys = () => {
    if (!tallys) {
      return;
    }
    const filteredTallys = tallys.filter((tally) => {
      if (weekdaysFilter.current.length > 0) {
        if (
          !weekdaysFilter.current.includes(
            weekdayFormatter.format(tally.startDate) as WeekdaysFilterItems,
          )
        ) {
          return false;
        }
      }

      if (initialDateFilter.current === 0 && finalDateFilter.current === 0) {
        return true;
      } else if (initialDateFilter.current === 0) {
        if (tally.startDate.getTime() <= finalDateFilter.current) return true;
      } else if (finalDateFilter.current === 0) {
        if (tally.startDate.getTime() >= initialDateFilter.current) return true;
      } else {
        if (
          tally.startDate.getTime() >= initialDateFilter.current &&
          tally.startDate.getTime() <= finalDateFilter.current
        ) {
          return true;
        }
      }
    });
    setActiveTallys(filteredTallys);
  };
  useEffect(() => {
    window.addEventListener("resize", () => {
      if (window.innerWidth < 1100) {
        setIsMobileView(true);
      } else {
        setIsMobileView(false);
      }
    });
    if (window.innerWidth < 1100) {
      setIsMobileView(true);
    } else {
      setIsMobileView(false);
    }
  }, []);
  return (
    <div className={"flex max-h-full min-h-0 flex-col gap-5 overflow-auto"}>
      {(!isMobileView ||
        (isMobileView && selectedScreen === "IN_PROGRESS")) && (
        <div
          className={`${!isMobileView && "max-h-[30vh] min-h-[150px]"} overflow-auto`}
        >
          <TallysInProgressSection
            locationId={locationId}
            locationName={locationName}
            userId={userId}
            ongoingTallys={ongoingTallys}
            isMobileView={isMobileView}
            selectedScreen={selectedScreen}
            setSelectedScreen={setSelectedScreen}
          />
        </div>
      )}
      {(!isMobileView || (isMobileView && selectedScreen === "FINALIZED")) && (
        <div className={`min-h-[150px] overflow-auto`}>
          <FinalizedTallysSection
            locationId={locationId}
            locationName={locationName}
            userId={userId}
            activeTallys={activeTallys}
            isMobileView={isMobileView}
            selectedScreen={selectedScreen}
            handleInitialDateChange={handleInitialDateChange}
            handleFinalDateChange={handleFinalDateChange}
            handleWeekdayChange={handleWeekdayChange}
            setSelectedScreen={setSelectedScreen}
          />
        </div>
      )}
    </div>
  );
};

export default TallyPage;
export { type TallyDataFetchedToTallyList, type WeekdaysFilterItems };
