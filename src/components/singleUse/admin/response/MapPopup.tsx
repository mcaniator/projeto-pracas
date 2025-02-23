"use client";

import { Button } from "@/components/button";
import { IconCheck, IconTrash, IconX } from "@tabler/icons-react";
import { IconMap } from "@tabler/icons-react";
import dynamic from "next/dynamic";
import { useRef, useState } from "react";
import {
  Dialog,
  DialogTrigger,
  Modal,
  ModalOverlay,
} from "react-aria-components";

import { ModalGeometry, ResponseGeometry } from "./responseForm";

const MapProvider = dynamic(() => import("./MapProvider"), { ssr: false });

const MapPopup = ({
  questionId,
  initialGeometries,
  geometryType,
  handleQuestionGeometryChange,
}: {
  questionId: number;
  initialGeometries: ModalGeometry[] | undefined;
  geometryType: ResponseGeometry;
  handleQuestionGeometryChange: (
    questionId: number,
    geometries: ModalGeometry[],
  ) => void;
}) => {
  const [isInSelectMode, setIsInSelectMode] = useState(false);
  const [currentGeometryType, setCurrentGeometryType] =
    useState<ResponseGeometry>(
      geometryType === "POINT_AND_POLYGON" ? "POINT" : geometryType,
    );
  const mapProviderRef = useRef<{
    saveGeometries: () => void;
    removeSelectedFeature: () => void;
  } | null>(null);

  const handleConcluir = () => {
    if (mapProviderRef.current) {
      mapProviderRef.current.saveGeometries();
    }
  };

  const handleChangeIsInSelectMode = (val: boolean) => {
    setIsInSelectMode(val);
  };

  const handleDeleteGeometry = () => {
    if (mapProviderRef.current) {
      mapProviderRef.current.removeSelectedFeature();
    }
    handleChangeIsInSelectMode(false);
  };
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
                  {geometryType === "POINT" && <div>Ponto</div>}
                  {geometryType === "POLYGON" && <div>Polígono</div>}
                  {geometryType === "POINT_AND_POLYGON" && (
                    <div className="inline-flex w-fit gap-1 rounded-xl bg-gray-400/20 py-1 shadow-inner">
                      <Button
                        variant={"ghost"}
                        onPress={() => setCurrentGeometryType("POINT")}
                        className={`rounded-xl px-4 py-1 ${currentGeometryType === "POINT" ? "bg-gray-200/20 shadow-md" : "bg-gray-400/0 shadow-none"}`}
                      >
                        Ponto
                      </Button>
                      <Button
                        variant={"ghost"}
                        onPress={() => setCurrentGeometryType("POLYGON")}
                        className={`rounded-xl bg-blue-500 px-4 py-1 ${currentGeometryType === "POLYGON" ? "bg-gray-200/20 shadow-md" : "bg-gray-400/0 shadow-none"}`}
                      >
                        Poligono
                      </Button>
                    </div>
                  )}

                  <div className="h-96 w-full rounded-lg bg-gray-200">
                    <MapProvider
                      questionId={questionId}
                      initialGeometries={initialGeometries}
                      handleQuestionGeometryChange={
                        handleQuestionGeometryChange
                      }
                      handleChangeIsInSelectMode={handleChangeIsInSelectMode}
                      drawType={
                        currentGeometryType === "POINT" ? "Point" : "Polygon"
                      }
                      ref={mapProviderRef}
                    ></MapProvider>
                  </div>
                  <span className="flex justify-between">
                    {isInSelectMode && (
                      <Button
                        variant={"destructive"}
                        className="w-fit"
                        onPress={() => handleDeleteGeometry()}
                      >
                        <IconTrash />
                      </Button>
                    )}
                    {!isInSelectMode && <div></div>}

                    <Button
                      variant={"constructive"}
                      className="w-fit"
                      onPress={() => {
                        handleConcluir();
                        close();
                      }}
                    >
                      <IconCheck />
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
