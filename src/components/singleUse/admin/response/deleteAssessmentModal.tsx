"use client";

import { Button } from "@/components/button";
import { IconTrash, IconX } from "@tabler/icons-react";
import { useState } from "react";
import {
  Dialog,
  DialogTrigger,
  Modal,
  ModalOverlay,
} from "react-aria-components";

import {
  deleteAssessment,
  redirectToFormsList,
} from "../../../../serverActions/assessmentUtil";
import LoadingIcon from "../../../LoadingIcon";

const DeleteAssessmentModal = ({
  assessmentId,
  locationId,
}: {
  assessmentId: number;
  locationId: number;
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const handleDeleteAssessment = async () => {
    setIsLoading(true);
    await deleteAssessment(assessmentId);
    setIsLoading(false);
    redirectToFormsList(locationId);
  };
  return (
    <DialogTrigger>
      <Button
        variant={"destructive"}
        className="items-center px-4 py-2 text-sm sm:text-xl"
      >
        <IconTrash />
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
                      Exlcuir avaliação
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
                  {isLoading ?
                    <div className="flex w-full items-center justify-center">
                      <LoadingIcon className="h-32 w-32" />
                    </div>
                  : <>
                      Esta ação é permanente!
                      <div className="flex w-full">
                        <Button
                          className="ml-auto"
                          variant={"destructive"}
                          onPress={() => void handleDeleteAssessment()}
                        >
                          Excluir
                        </Button>
                      </div>
                    </>
                  }
                </div>
              )}
            </Dialog>
          </Modal>
        </ModalOverlay>
      }
    </DialogTrigger>
  );
};

export { DeleteAssessmentModal };
