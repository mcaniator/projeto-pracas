"use client";

import { Button } from "@/components/button";
import { IconX } from "@tabler/icons-react";
import {
  Dialog,
  DialogTrigger,
  Modal,
  ModalOverlay,
} from "react-aria-components";

import { SelectedLocationObj } from "./client";
import { ParkSearch } from "./parkSearch";

const ParkSearchModal = ({
  locations,
  selectedLocationsObjs,
  handleSelectedLocationsAddition,
}: {
  locations: { id: number; name: string }[];
  selectedLocationsObjs: SelectedLocationObj[];
  handleSelectedLocationsAddition: (locationObj: SelectedLocationObj) => void;
}) => {
  return (
    <DialogTrigger>
      <Button className="w-fit items-center p-2">Buscar praça</Button>
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
            style={{}}
          >
            <Dialog className="outline-none data-[focus-visible]:outline data-[focus-visible]:ring-1 data-[focus-visible]:ring-ring">
              {({ close }) => (
                <div className="flex flex-col gap-2">
                  <div className="flex">
                    <h4 className="text-2xl font-semibold sm:text-4xl">
                      Busca de praças
                    </h4>
                    <Button
                      className="ml-auto text-black"
                      variant={"ghost"}
                      size={"icon"}
                      onPress={() => {
                        close();
                      }}
                    >
                      <IconX />
                    </Button>
                  </div>

                  <div className={"flex flex-col gap-1 overflow-auto"}>
                    <h4 className="text-xl font-semibold">
                      Selecione as praças as quais deseja exportar dados
                    </h4>
                    <ParkSearch
                      location={locations}
                      selectedLocations={selectedLocationsObjs}
                      handleSelectedLocationsAddition={
                        handleSelectedLocationsAddition
                      }
                    />
                  </div>
                </div>
              )}
            </Dialog>
          </Modal>
        </ModalOverlay>
      }
    </DialogTrigger>
  );
};

export { ParkSearchModal };
