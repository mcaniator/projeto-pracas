"use client";

import { Button } from "@/components/button";
import { IconCheck, IconX } from "@tabler/icons-react";
import { redirect } from "next/navigation";
import { useActionState, useEffect, useState } from "react";
import {
  Dialog,
  DialogTrigger,
  Modal,
  ModalOverlay,
} from "react-aria-components";

import LoadingIcon from "../../../../../components/LoadingIcon";
import { deleteFormVersion } from "../../../../../serverActions/formUtil";

const FormVersionDeletionModal = ({
  formId,
  formName,
  formVersion,
}: {
  formId: number;
  formName: string;
  formVersion: number;
}) => {
  const [state, formAction, isPending] = useActionState(
    deleteFormVersion,
    null,
  );
  const [pageState, setPageState] = useState<"FORM" | "SUCCESS" | "ERROR">(
    "FORM",
  );
  const [isOpen, setIsOpen] = useState(false);
  useEffect(() => {
    if (state?.statusCode === 200) {
      setPageState("SUCCESS");
    } else if (state?.statusCode === 409 || state?.statusCode === 500)
      setPageState("ERROR");
  }, [state]);

  useEffect(() => {
    if (!isOpen) {
      if (state?.statusCode === 200) {
        redirect("/admin/registration/forms");
      }
    }
  }, [isOpen, state]);
  return (
    <DialogTrigger onOpenChange={(open) => setIsOpen(open)}>
      <Button
        className="ml-auto items-center p-2 text-sm sm:ml-0 sm:text-xl"
        variant={"destructive"}
      >
        Excluir versão
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
              `max-h-full w-[90%] max-w-lg overflow-y-scroll rounded-2xl bg-off-white p-6 text-left align-middle shadow-xl ${
                isEntering ? "duration-300 ease-out animate-in zoom-in-95" : ""
              } ${isExiting ? "duration-200 ease-in animate-out zoom-out-95" : ""}`
            }
          >
            <Dialog className="outline-none data-[focus-visible]:outline data-[focus-visible]:ring-1 data-[focus-visible]:ring-ring">
              {({ close }) => (
                <div className="flex flex-col gap-2">
                  <div className="flex">
                    <h4 className="text-2xl font-semibold sm:text-4xl">
                      Apagar versão de formulário
                    </h4>
                    <Button
                      className="ml-auto"
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
                    <form
                      action={formAction}
                      className="flex w-full flex-col rounded-l"
                    >
                      <h5 className="text-base font-semibold sm:text-xl">
                        {formName}
                      </h5>
                      <h6 className="text-base font-semibold sm:text-xl">{`Versão: ${formVersion}`}</h6>
                      {formVersion === 0 && (
                        <h6 className="text-base font-semibold text-red-500">
                          Aviso: Este formulário está na versão 0, após sua
                          exclusão não haverão mais versões.
                        </h6>
                      )}

                      <input
                        type="hidden"
                        id="formId"
                        name="formId"
                        value={formId}
                      />

                      <div className="mt-3 flex justify-end">
                        <Button type="submit" variant={"destructive"}>
                          Excluir
                        </Button>
                      </div>
                    </form>
                  )}
                  {pageState === "SUCCESS" && (
                    <div>
                      <h5 className="text-center text-xl font-semibold">
                        {`Formulário "${state?.content.form?.name}", versão ${state?.content.form?.version} excluído!`}
                      </h5>
                      <div className="flex justify-center">
                        <IconCheck className="h-32 w-32 text-2xl text-green-500" />
                      </div>
                    </div>
                  )}
                  {pageState === "ERROR" && (
                    <div>
                      {state?.statusCode === 500 && (
                        <h5 className="text-center text-xl font-semibold">
                          Algo deu errado!
                        </h5>
                      )}
                      {state?.statusCode === 409 && (
                        <h5 className="text-center text-xl font-semibold text-red-500">
                          {`Este formulário possui ${
                            state.content.assessmentsWithForm.length
                          } ${state.content.assessmentsWithForm.length === 1 ? "avaliação" : "avaliações"} associada${state.content.assessmentsWithForm.length === 1 ? "" : "s"}!`}
                        </h5>
                      )}

                      <div className="flex justify-center">
                        <IconX className="h-32 w-32 text-2xl text-red-500" />
                      </div>
                      {state?.content.assessmentsWithForm &&
                        state?.content.assessmentsWithForm.length >= 1 && (
                          <>
                            <h6 className="text-xl font-semibold">
                              Data de início das Avaliações:
                            </h6>
                            <ul className="list-inside list-decimal break-words pl-3 font-semibold">
                              {state?.content.assessmentsWithForm.map((a) => {
                                return (
                                  <li key={a.id}>
                                    {a.startDate.toLocaleString("pt-BR", {
                                      day: "2-digit",
                                      month: "2-digit",
                                      year: "2-digit",
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}
                                  </li>
                                );
                              })}
                            </ul>
                          </>
                        )}
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

export { FormVersionDeletionModal };
