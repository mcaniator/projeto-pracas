"use client";

import { Button } from "@/components/button";
import LoadingIcon from "@components/LoadingIcon";
import { useHelperCard } from "@components/context/helperCardContext";
import { _deleteFormVersion } from "@serverActions/formUtil";
import {
  IconCalendarClock,
  IconCheck,
  IconMapPin,
  IconUser,
  IconX,
} from "@tabler/icons-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { useActionState, useEffect, useState } from "react";
import {
  Dialog,
  DialogTrigger,
  Modal,
  ModalOverlay,
} from "react-aria-components";

const FormVersionDeletionModal = ({
  formId,
  formName,
}: {
  formId: number;
  formName: string;
}) => {
  const { setHelperCard } = useHelperCard();
  const [state, formAction, isPending] = useActionState(
    _deleteFormVersion,
    null,
  );
  const [pageState, setPageState] = useState<"FORM" | "SUCCESS" | "ERROR">(
    "FORM",
  );
  const [isOpen, setIsOpen] = useState(false);
  useEffect(() => {
    if (state?.statusCode === 200) {
      setHelperCard({
        show: true,
        helperCardType: "CONFIRM",
        content: <>Versão de formulário excluída!</>,
      });
      setPageState("SUCCESS");
    } else if (state?.statusCode === 401) {
      setHelperCard({
        show: true,
        helperCardType: "ERROR",
        content: <>Sem permissão para excluir formulário!</>,
      });
      setPageState("ERROR");
    } else if (state?.statusCode === 409 || state?.statusCode === 500)
      setHelperCard({
        show: true,
        helperCardType: "ERROR",
        content: <>Erro ao excluir formulário!</>,
      });
    setPageState("ERROR");
  }, [state, setHelperCard]);

  useEffect(() => {
    if (!isOpen) {
      if (state?.statusCode === 200) {
        redirect("/admin/registration/forms");
      }
    }
  }, [isOpen, state]);
  return (
    <DialogTrigger
      onOpenChange={(open) => {
        setPageState("FORM");
        setIsOpen(open);
      }}
    >
      <Button
        className="ml-auto items-center p-2 text-sm sm:ml-0 sm:text-xl"
        variant={"destructive"}
      >
        Excluir versão
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
              `mb-auto mt-auto w-[90%] max-w-lg transform overflow-auto rounded-2xl bg-off-white p-6 text-left align-middle shadow-xl ${
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
                    <form
                      action={formAction}
                      className="flex w-full flex-col rounded-l"
                    >
                      <h5 className="text-base font-semibold sm:text-xl">
                        {formName}
                      </h5>

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
                              Avaliações:
                            </h6>
                            <ul className="list-inside list-decimal break-words pl-3 font-semibold">
                              {state?.content.assessmentsWithForm.map(
                                (a, index) => {
                                  return (
                                    <li
                                      key={a.id}
                                      className={`${index % 2 === 0 ? "bg-transparent/10" : "bg-transparent/5"} hover:bg-transparent/10 hover:underline`}
                                    >
                                      <Link
                                        href={`/admin/parks/${a.location.id}/responses/${formId}/${a.id}`}
                                        className={`flex flex-col`}
                                      >
                                        <span>
                                          <IconMapPin className="mb-2 inline" />
                                          {a.location.name}
                                        </span>
                                        <span>
                                          <IconCalendarClock className="mb-2 inline" />
                                          {a.startDate.toLocaleString("pt-BR", {
                                            day: "2-digit",
                                            month: "2-digit",
                                            year: "2-digit",
                                            hour: "2-digit",
                                            minute: "2-digit",
                                          })}
                                        </span>
                                        <span>
                                          <IconUser className="mb-2 inline" />
                                          {a.user.username}
                                        </span>
                                      </Link>
                                    </li>
                                  );
                                },
                              )}
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
