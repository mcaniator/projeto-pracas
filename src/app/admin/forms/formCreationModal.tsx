"use client";

import { Button } from "@/components/button";
import CTextField from "@/components/ui/cTextField";
import LoadingIcon from "@components/LoadingIcon";
import { useHelperCard } from "@components/context/helperCardContext";
import { _formSubmit } from "@serverActions/formUtil";
import { IconCheck, IconCirclePlus, IconX } from "@tabler/icons-react";
import { useActionState, useEffect, useState } from "react";
import {
  Dialog,
  DialogTrigger,
  Modal,
  ModalOverlay,
} from "react-aria-components";

const FormCreationModal = () => {
  const { setHelperCard } = useHelperCard();
  const [state, formAction, isPending] = useActionState(_formSubmit, null);
  const [pageState, setPageState] = useState<"FORM" | "SUCCESS" | "ERROR">(
    "FORM",
  );
  const [isOpen, setIsOpen] = useState(false);
  const [enableSave, setEnableSave] = useState(false);
  useEffect(() => {
    if (state?.statusCode === 201) {
      setHelperCard({
        show: true,
        helperCardType: "CONFIRM",
        content: <>Formulário criado!</>,
      });
      setPageState("SUCCESS");
    } else if (state?.statusCode === 401) {
      setHelperCard({
        show: true,
        helperCardType: "ERROR",
        content: <>Sem permissão para criar formulário!</>,
      });
      setPageState("ERROR");
    } else if (state?.statusCode === 400 || state?.statusCode === 500) {
      setHelperCard({
        show: true,
        helperCardType: "ERROR",
        content: <>Erro ao criar formulário!</>,
      });
      setPageState("ERROR");
    }
  }, [state, setHelperCard]);

  useEffect(() => {
    if (!isOpen) {
      setPageState("FORM");
    }
  }, [isOpen]);
  return (
    <DialogTrigger
      onOpenChange={(open) => {
        setPageState("FORM");
        setIsOpen(open);
      }}
    >
      <Button
        className="items-center p-2 text-sm sm:text-xl"
        variant={"constructive"}
      >
        <IconCirclePlus />
      </Button>
      {
        <ModalOverlay
          className={({ isEntering, isExiting }) =>
            `fixed inset-0 z-40 flex min-h-full items-center justify-center overflow-y-auto bg-black/25 p-4 text-center backdrop-blur ${
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
                  <div className="flex">
                    <h4 className="text-2xl font-semibold sm:text-4xl">
                      Criar formulário
                    </h4>
                    <Button
                      className="ml-auto text-black"
                      variant={"ghost"}
                      size={"icon"}
                      onPress={() => {
                        setIsOpen(false);
                        close();
                      }}
                    >
                      <IconX />
                    </Button>
                  </div>
                  {isPending && (
                    <div className="flex justify-center">
                      <LoadingIcon className="h-32 w-32 text-2xl" />
                    </div>
                  )}
                  {!isPending && pageState === "FORM" && (
                    <form action={formAction} className={"flex flex-col gap-2"}>
                      <div>
                        <label htmlFor={"name"}></label>
                        <CTextField
                          type="text"
                          name="name"
                          id={"name"}
                          label="Nome do formulário"
                          errorMessage="Obrigatório"
                          required
                          onRequiredCheck={(e) => {
                            setEnableSave(e);
                          }}
                          className={`${state?.statusCode === 409 ? "w-full outline outline-2 outline-red-500" : "w-full"}`}
                        />

                        {state?.statusCode === 409 && (
                          <p className="text-red-500">
                            Este formulário já existe!
                          </p>
                        )}
                      </div>
                      <Button
                        variant={"constructive"}
                        type="submit"
                        className={"ml-auto w-min"}
                        isDisabled={!enableSave}
                      >
                        Criar
                      </Button>
                    </form>
                  )}
                  {pageState === "SUCCESS" && (
                    <div>
                      <h5 className="text-center text-xl font-semibold">
                        {`Formulário "${state?.formName}" criado!`}
                      </h5>
                      <div className="flex justify-center">
                        <IconCheck className="h-32 w-32 text-2xl text-green-500" />
                      </div>
                    </div>
                  )}
                  {pageState === "ERROR" && (
                    <div>
                      <h5 className="text-center text-xl font-semibold">
                        Algo deu errado!
                      </h5>
                      <div className="flex justify-center">
                        <IconX className="h-32 w-32 text-2xl text-red-500" />
                      </div>
                    </div>
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

export { FormCreationModal };
