"use client";

import { Button } from "@/components/button";
import { IconX } from "@tabler/icons-react";
import { Dispatch, SetStateAction, useState } from "react";
import {
  Dialog,
  DialogTrigger,
  Modal,
  ModalOverlay,
} from "react-aria-components";

import LocationRegisterForm from "../../../components/locationForm/locationRegisterForm";
import { FetchCitiesType } from "../../../serverActions/cityUtil";

const CreationWithoutDrawingModal = ({
  setCurrentId,
  setDrawingWindowVisible,
  cities,
  locationCategories,
  locationTypes,
}: {
  setCurrentId: Dispatch<SetStateAction<number>>;
  setDrawingWindowVisible: Dispatch<SetStateAction<boolean>>;
  cities: FetchCitiesType;
  locationCategories: {
    statusCode: number;
    message: string;
    categories: {
      id: number;
      name: string;
    }[];
  };
  locationTypes: {
    statusCode: number;
    message: string;
    types: {
      id: number;
      name: string;
    }[];
  };
}) => {
  const [open, setOpen] = useState(false);

  return (
    <DialogTrigger
      isOpen={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen);

        if (!isOpen) {
          setTimeout(() => {}, 200); // time required for the fade out to finish
        }
      }}
    >
      <Button
        type="button"
        variant={"admin"}
        onPress={() => setDrawingWindowVisible(false)}
      >
        <span className="-mb-1 text-white transition-all group-data-[disabled]:text-opacity-50">
          Criar sem desenho
        </span>
      </Button>
      <ModalOverlay
        className={({ isEntering, isExiting }) =>
          `fixed inset-0 z-50 flex min-h-full items-center justify-center overflow-y-auto bg-black/25 p-4 text-center backdrop-blur ${isEntering ? "duration-300 ease-out animate-in fade-in" : ""} ${isExiting ? "duration-200 ease-in animate-out fade-out" : ""} `
        }
        isDismissable
      >
        <Modal
          className={({ isEntering, isExiting }) =>
            `max-h-full w-full max-w-lg overflow-scroll rounded-2xl bg-off-white p-6 text-left align-middle shadow-xl ${isEntering ? "duration-300 ease-out animate-in zoom-in-95" : ""} ${isExiting ? "duration-200 ease-in animate-out zoom-out-95" : ""} `
          }
        >
          <Dialog className="outline-none data-[focus-visible]:outline data-[focus-visible]:ring-1 data-[focus-visible]:ring-ring">
            {({ close }) => {
              return (
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between">
                    <h2 className="text-4xl font-semibold">Criar Praça</h2>
                    <Button variant={"ghost"} size={"icon"} onPress={close}>
                      <IconX />
                    </Button>
                  </div>
                  <LocationRegisterForm
                    cities={cities}
                    formType="CREATE"
                    locationCategories={locationCategories}
                    locationTypes={locationTypes}
                    onSuccess={() => {
                      close();
                      setTimeout(() => {
                        setCurrentId(-2);
                        setDrawingWindowVisible(true);
                      }, 200);
                    }}
                  />
                </div>
              );
            }}
          </Dialog>
        </Modal>
      </ModalOverlay>
    </DialogTrigger>
  );
};

export { CreationWithoutDrawingModal };
