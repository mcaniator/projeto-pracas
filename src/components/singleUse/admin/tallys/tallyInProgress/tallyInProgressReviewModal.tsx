"use client";

import { Button } from "@/components/button";
import { WeatherConditions } from "@prisma/client";
import { IconChartBar, IconX } from "@tabler/icons-react";
import { useState } from "react";
import {
  Dialog,
  DialogTrigger,
  Modal,
  ModalOverlay,
} from "react-aria-components";

import { Select } from "../../../../ui/select";
import { TallyInProgressCharts } from "./tallyInProgressCharts";
import { TallyInProgressDatabaseOptions } from "./tallyInProgressDatabaseOptions";
import {
  CommercialActivitiesObject,
  SubmittingObj,
  WeatherStats,
  ongoingTallyDataFetched,
} from "./tallyInProgressPage";
import { AssistBarStates, weatherNameMap } from "./tallyInProgressReview";
import { TallyInProgressTextualData } from "./tallyInProgressTextualData";

const TallyInProgressReviewModal = ({
  submittingObj,
  tallyId,
  locationId,
  tally,
  weatherStats,
  complementaryData,
  commercialActivities,
  tallyMap,
  setSubmittingObj,
}: {
  submittingObj: {
    submitting: boolean;
    finishing: boolean;
    deleting: boolean;
  };
  tallyId: number;
  locationId: number;
  tally: ongoingTallyDataFetched;
  weatherStats: WeatherStats;
  complementaryData: {
    animalsAmount: number;
    groupsAmount: number;
  };
  commercialActivities: CommercialActivitiesObject;
  tallyMap: Map<string, number>;
  setSubmittingObj: React.Dispatch<React.SetStateAction<SubmittingObj>>;
}) => {
  const [modalState, setModalState] = useState<AssistBarStates>("TEXTUAL_DATA");
  const handleModalStateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newState = e.target.value as AssistBarStates;
    setModalState(newState);
  };
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
              `max-h-full w-[90%] max-w-lg overflow-scroll rounded-2xl bg-off-white p-6 text-left align-middle shadow-xl ${
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
                  <Select onChange={handleModalStateChange}>
                    <option value="TEXTUAL_DATA">Dados textuais</option>
                    <option value="CHARTS">Gráficos</option>
                    <option value="SAVE_DELETE">Salvar/Excluir</option>
                  </Select>
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
                  {modalState === "SAVE_DELETE" && (
                    <TallyInProgressDatabaseOptions
                      tallyId={tallyId}
                      locationId={locationId}
                      tallyMap={tallyMap}
                      weatherStats={weatherStats}
                      commercialActivities={commercialActivities}
                      complementaryData={complementaryData}
                      submittingObj={submittingObj}
                      setSubmittingObj={setSubmittingObj}
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
