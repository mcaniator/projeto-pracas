import { Button } from "@/components/button";
import { IconDeviceFloppy, IconX } from "@tabler/icons-react";
import {
  Dialog,
  DialogTrigger,
  Modal,
  ModalOverlay,
} from "react-aria-components";

import { TallyInProgressDatabaseOptions } from "./tallyInProgressDatabaseOptions";
import {
  CommercialActivitiesObject,
  SubmittingObj,
  WeatherStats,
} from "./tallyInProgressPage";

const TallyInProgressSaveModal = ({
  submittingObj,
  tallyId,
  locationId,
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
  weatherStats: WeatherStats;
  complementaryData: {
    animalsAmount: number;
    groupsAmount: number;
  };
  commercialActivities: CommercialActivitiesObject;
  tallyMap: Map<string, number>;
  setSubmittingObj: React.Dispatch<React.SetStateAction<SubmittingObj>>;
}) => {
  return (
    <DialogTrigger>
      <Button
        variant={"constructive"}
        className="items-center p-2 text-sm sm:text-xl"
      >
        <IconDeviceFloppy />
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
                      Salvar
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
                </div>
              )}
            </Dialog>
          </Modal>
        </ModalOverlay>
      }
    </DialogTrigger>
  );
};

export default TallyInProgressSaveModal;
