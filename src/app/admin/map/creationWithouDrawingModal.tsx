"use client";

import { Button } from "@/components/button";
import { FormInput } from "@/components/formInput";
import { Input } from "@/components/input";
import type { zodErrorType } from "@/lib/zodValidators";
import { createLocation } from "@/serverActions/manageLocations";
import { IconX } from "@tabler/icons-react";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import {
  Dialog,
  DialogTrigger,
  Key,
  Modal,
  ModalOverlay,
  Tab,
  TabList,
  TabPanel,
  Tabs,
} from "react-aria-components";
import { useFormState } from "react-dom";
import { z } from "zod";

import {
  basicAnswerDescriptions,
  basicAnswerLabels,
  basicAnswerSchema,
  extraAnswerDescriptions,
  extraAnswerLabels,
  extraAnswerSchema,
} from "./answerSchemas";

const CreationWithoutDrawingModal = ({
  setCurrentId,
}: {
  setCurrentId: Dispatch<SetStateAction<number>>;
}) => {
  const [basicAnswerValues, setBasicAnswerValues] = useState<
    z.infer<typeof basicAnswerSchema>
  >({
    name: "",
    firstStreet: "",
    secondStreet: "",
  });

  const [basicErrorValues, setBasicErrorValues] = useState<zodErrorType<
    typeof basicAnswerSchema
  > | null>({});

  const checkBasicValidity = (key: keyof z.infer<typeof basicAnswerSchema>) => {
    const result = basicAnswerSchema.safeParse(basicAnswerValues);

    if (result.success) {
      setBasicErrorValues(null);
    } else {
      const errors = result.error.flatten().fieldErrors;

      setBasicErrorValues({
        ...basicErrorValues,
        [key]: errors[key],
      });
    }
  };

  const [extraAnswerValues, setExtraAnswerValues] = useState<
    z.infer<typeof extraAnswerSchema>
  >({
    creationYear: undefined,
    lastMaintenanceYear: undefined,
    overseeingMayor: undefined,
    legislation: undefined,
    legalArea: undefined,
    incline: undefined,
  });

  const [extraErrorValues, setExtraErrorValues] = useState<zodErrorType<
    typeof extraAnswerSchema
  > | null>(null);

  const checkExtraValidity = (key: keyof z.infer<typeof extraAnswerSchema>) => {
    const result = extraAnswerSchema.safeParse(extraAnswerValues);

    if (result.success) {
      setExtraErrorValues(null);
    } else {
      const errors = result.error.flatten().fieldErrors;

      setExtraErrorValues({
        ...extraErrorValues,
        [key]: errors[key],
      });
    }
  };

  const [state, formAction] = useFormState(createLocation, {
    errorCode: -1,
    errorMessage: "Initial",
  });
  const [buttonError, setButtoError] = useState(false);
  useEffect(() => {
    if (state.errorCode === 0) {
      setOpen(false);
      setTimeout(() => {
        setCurrentId(-2);
      }, 200);
    } else if (state.errorCode !== -1) {
      setButtoError(true);

      setTimeout(() => {
        setButtoError(false);
      }, 2000);
    }
  }, [state, setCurrentId]);

  const [selectedTab, setSelectedTab] = useState<Key>("basic");
  const [open, setOpen] = useState(false);

  return (
    <DialogTrigger
      isOpen={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen);

        if (!isOpen) {
          setTimeout(() => {
            setSelectedTab("basic");
            setBasicErrorValues({});
            setBasicAnswerValues({
              name: "",
              firstStreet: "",
              secondStreet: "",
            });
            setExtraAnswerValues({
              creationYear: undefined,
              lastMaintenanceYear: undefined,
              overseeingMayor: undefined,
              legislation: undefined,
              legalArea: undefined,
              incline: undefined,
            });
            setExtraErrorValues(null);
          }, 200); // time required for the fade out to finish
        }
      }}
    >
      <Button type="button" variant={"admin"}>
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
                  <form action={formAction}>
                    <Tabs
                      className={"flex flex-col"}
                      selectedKey={selectedTab}
                      onSelectionChange={setSelectedTab}
                    >
                      <div className="flex">
                        <TabList className={"flex gap-2"}>
                          <Tab id={"basic"} className={"group"}>
                            <span
                              className={`cursor-default text-4xl font-semibold opacity-50 transition-all group-data-[selected]:opacity-100 ${
                                basicErrorValues !== null &&
                                (basicErrorValues.name !== undefined ||
                                  basicErrorValues.firstStreet !== undefined ||
                                  basicErrorValues.secondStreet) &&
                                "text-cordovan"
                              }`}
                            >
                              Básico
                            </span>
                          </Tab>

                          <Tab id={"extra"} className={"group"}>
                            <span
                              className={`cursor-default text-4xl font-semibold opacity-50 transition-all group-data-[selected]:opacity-100 ${
                                extraErrorValues !== null && "text-cordovan"
                              }`}
                            >
                              Extra
                            </span>
                          </Tab>
                        </TabList>
                        <Button
                          className="ml-auto"
                          variant={"ghost"}
                          size={"icon"}
                          onPress={close}
                        >
                          <IconX />
                        </Button>
                      </div>

                      <TabPanel id="basic">
                        <h2 className="leading-tight text-gray-500">
                          Informações mínimas necessárias para a criação de uma
                          praça
                        </h2>
                        <div className="flex flex-col gap-2">
                          {Object.keys(basicAnswerValues).map(
                            (value, index) => (
                              <FormInput<z.infer<typeof basicAnswerSchema>>
                                key={index}
                                // @ts-expect-error TS doesn't realize that value is always a key of basicAnswerSchema,
                                // this could be solved by manually typing every field but this is cooler lol
                                objectKey={value}
                                answerValues={basicAnswerValues}
                                setAnswerValues={setBasicAnswerValues}
                                errorValues={basicErrorValues}
                                checker={checkBasicValidity}
                                label={basicAnswerLabels[index]!}
                                description={basicAnswerDescriptions[index]}
                              />
                            ),
                          )}

                          {
                            // mapping inputs that aren't currently being rendered so that they're sent to the server
                            Object.entries(extraAnswerValues).map(
                              (value, index) => {
                                return (
                                  <Input
                                    key={index}
                                    type="hidden"
                                    name={value[0]}
                                    value={value[1]}
                                  />
                                );
                              },
                            )
                          }
                        </div>
                      </TabPanel>

                      <TabPanel id="extra">
                        <h2 className="leading-tight text-gray-500">
                          Informações extras que podem ser adicionadas à uma
                          praça
                        </h2>
                        <div className="flex flex-col gap-2">
                          <div>
                            <label className="text-2xl" htmlFor="file">
                              Arquivo shapefile
                            </label>
                            <input type="file" id="file" name="file" />
                          </div>

                          {Object.keys(extraAnswerValues).map(
                            (value, index) => (
                              <FormInput<z.infer<typeof extraAnswerSchema>>
                                key={index}
                                // @ts-expect-error same thing as the previous one
                                objectKey={value}
                                answerValues={extraAnswerValues}
                                setAnswerValues={setExtraAnswerValues}
                                errorValues={extraErrorValues}
                                checker={checkExtraValidity}
                                label={extraAnswerLabels[index]!}
                                description={extraAnswerDescriptions[index]}
                              />
                            ),
                          )}

                          {
                            // mapping inputs that aren't currently being rendered so that they're sent to the server
                            Object.entries(basicAnswerValues).map(
                              (value, index) => {
                                return (
                                  <Input
                                    key={index}
                                    type="hidden"
                                    name={value[0]}
                                    value={value[1]}
                                  />
                                );
                              },
                            )
                          }
                        </div>
                      </TabPanel>
                    </Tabs>

                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant={"admin"}
                        className="ml-auto"
                        onPress={() => {
                          const result =
                            basicAnswerSchema.safeParse(basicAnswerValues);

                          if (result.success) {
                            setBasicErrorValues(null);

                            if (selectedTab === "basic")
                              setSelectedTab("extra");
                            else setSelectedTab("basic");
                          } else {
                            setBasicErrorValues(
                              result.error.flatten().fieldErrors,
                            );
                          }
                        }}
                      >
                        <span className="-mb-1 text-white">
                          {selectedTab === "basic" ? "Próximo" : "Anterior"}
                        </span>
                      </Button>

                      <Button
                        variant={buttonError ? "destructive" : "admin"}
                        type="submit"
                        isDisabled={
                          basicErrorValues !== null || extraErrorValues !== null
                        }
                      >
                        <span className="-mb-1 text-white group-disabled:text-opacity-30">
                          Enviar
                        </span>
                      </Button>
                    </div>
                  </form>
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
