"use client";

import { Button } from "@/components/button";
import { WeatherConditions } from "@prisma/client";
import { IconChartBar, IconLogs, IconX } from "@tabler/icons-react";
import { useState } from "react";
import {
  Dialog,
  DialogTrigger,
  Modal,
  ModalOverlay,
} from "react-aria-components";

import { TallyInProgressCharts } from "./tallyInProgressCharts";
import {
  CommercialActivitiesObject,
  WeatherStats,
  ongoingTallyDataFetched,
} from "./tallyInProgressPage";
import { AssistBarStates, weatherNameMap } from "./tallyInProgressReview";
import { TallyInProgressTextualData } from "./tallyInProgressTextualData";

const TallyInProgressReviewModal = ({
  tally,
  weatherStats,
  complementaryData,
  commercialActivities,
  tallyMap,
}: {
  tally: ongoingTallyDataFetched;
  weatherStats: WeatherStats;
  complementaryData: {
    animalsAmount: number;
    groupsAmount: number;
  };
  commercialActivities: CommercialActivitiesObject;
  tallyMap: Map<string, number>;
}) => {
  const [modalState, setModalState] = useState<AssistBarStates>("TEXTUAL_DATA");

  return (
    <DialogTrigger>
      <Button className="items-center p-2 text-sm sm:text-xl">
        <IconChartBar />
      </Button>
      {
        <ModalOverlay
          className={({ isEntering, isExiting }) =>
            `fixed inset-0 z-50 flex min-h-full items-center justify-center overflow-y-auto bg-black/25 p-4 text-center backdrop-blur ${
              isEntering ? "duration-300 ease-out animate-in fade-in" : ""
            } ${isExiting ? "duration-200 ease-in animate-out fade-out" : ""}`
          }
          isDismissable
        >
          <Modal
            className={({ isEntering, isExiting }) =>
              `mb-auto mt-auto w-[90%] max-w-lg transform overflow-auto rounded-2xl bg-off-white p-6 text-left align-middle shadow-xl ${
                isEntering ? "duration-300 ease-out animate-in zoom-in-95" : ""
              } ${isExiting ? "duration-200 ease-in animate-out zoom-out-95" : ""}`
            }
          >
            <Dialog className="outline-none data-[focus-visible]:outline data-[focus-visible]:ring-1 data-[focus-visible]:ring-ring">
              {({ close }) => (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center">
                    <h4 className="text-xl font-semibold sm:text-4xl">
                      Acompanhamento
                    </h4>
                    <Button
                      className="ml-auto"
                      variant={"ghost"}
                      size={"icon"}
                      onPress={() => {
                        close();
                      }}
                    >
                      <IconX />
                    </Button>
                  </div>
                  <div className="inline-flex w-fit flex-row gap-1 rounded-xl bg-gray-400/20 py-1 shadow-inner">
                    <Button
                      variant={"ghost"}
                      className={`rounded-xl px-4 py-1 ${modalState === "TEXTUAL_DATA" ? "bg-gray-200/20 shadow-md" : "bg-gray-400/0 shadow-none"}`}
                      onPress={() => setModalState("TEXTUAL_DATA")}
                    >
                      <IconLogs />
                    </Button>
                    <Button
                      variant={"ghost"}
                      className={`rounded-xl px-4 py-1 ${modalState === "CHARTS" ? "bg-gray-200/20 shadow-md" : "bg-gray-400/0 shadow-none"}`}
                      onPress={() => setModalState("CHARTS")}
                    >
                      <IconChartBar />
                    </Button>
                  </div>

                  {modalState === "TEXTUAL_DATA" && (
                    <TallyInProgressTextualData
                      tally={tally}
                      temperature={weatherStats.temperature}
                      weather={
                        weatherNameMap.get(
                          weatherStats.weather,
                        ) as WeatherConditions
                      }
                      complementaryData={complementaryData}
                      commercialActivities={commercialActivities}
                    />
                  )}
                  {modalState === "CHARTS" && (
                    <TallyInProgressCharts
                      tallyMap={tallyMap}
                      isOnModal={true}
                    />
                  )}
                </div>
              )}
            </Dialog>
          </Modal>
        </ModalOverlay>
      }
    </DialogTrigger>
  );
};

export { TallyInProgressReviewModal };
