"use client";

import { Button } from "@/components/button";
import { IconX } from "@tabler/icons-react";
import { IconMap } from "@tabler/icons-react";
import { useRef } from "react";
import {
  Dialog,
  DialogTrigger,
  Modal,
  ModalOverlay,
} from "react-aria-components";

import MapProvider from "./MapProvider";
import { ModalGeometry } from "./responseForm";

const MapPopup = ({
  questionId,
  initialGeometries,
  handleQuestionGeometryChange,
}: {
  questionId: number;
  initialGeometries: ModalGeometry[] | undefined;
  handleQuestionGeometryChange: (
    questionId: number,
    geometries: ModalGeometry[],
  ) => void;
}) => {
  const mapProviderRef = useRef<{
    saveGeometries: () => void;
  } | null>(null);

  const handleConcluir = () => {
    if (mapProviderRef.current) {
      mapProviderRef.current.saveGeometries();
    }
  };
  //console.log("Geometrias salvas:", geometries);
  return (
    <DialogTrigger>
      <Button className="items-center p-2">
        <IconMap />
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
              `max-h-full w-full max-w-lg overflow-scroll rounded-2xl bg-off-white p-6 text-left align-middle shadow-xl ${
                isEntering ? "duration-300 ease-out animate-in zoom-in-95" : ""
              } ${isExiting ? "duration-200 ease-in animate-out zoom-out-95" : ""}`
            }
          >
            <Dialog className="outline-none data-[focus-visible]:outline data-[focus-visible]:ring-1 data-[focus-visible]:ring-ring">
              {({ close }) => (
                <div className="flex flex-col gap-2">
                  <div className="flex">
                    <h4 className="text-2xl">{`Mapa`}</h4>
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

                  <div className="h-96 w-full rounded-lg bg-gray-200">
                    <MapProvider
                      questionId={questionId}
                      initialGeometries={initialGeometries}
                      handleQuestionGeometryChange={
                        handleQuestionGeometryChange
                      }
                      ref={mapProviderRef}
                    ></MapProvider>
                  </div>

                  <span className="ml-auto">
                    <Button
                      variant={"constructive"}
                      className="w-fit"
                      onPress={() => {
                        handleConcluir();
                        close();
                      }}
                    >
                      Concluir
                    </Button>
                  </span>
                </div>
              )}
            </Dialog>
          </Modal>
        </ModalOverlay>
      }
    </DialogTrigger>
  );
};

export { MapPopup };