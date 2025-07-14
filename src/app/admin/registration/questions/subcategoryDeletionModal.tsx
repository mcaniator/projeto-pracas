"use client";

import { Button } from "@/components/button";
import LoadingIcon from "@components/LoadingIcon";
import { useHelperCard } from "@components/context/helperCardContext";
import { _deleteSubcategory } from "@serverActions/categoryServerActions";
import { IconCheck, IconTrash, IconX } from "@tabler/icons-react";
import { useActionState, useEffect, useState } from "react";
import {
  Dialog,
  DialogTrigger,
  Modal,
  ModalOverlay,
} from "react-aria-components";

const SubcategoryDeletionModal = ({
  subcategoryId,
  subcategoryName,
  categoryName,
  fetchCategoriesAfterDeletion,
}: {
  subcategoryId: number | undefined;
  subcategoryName: string | undefined;
  categoryName: string | undefined;
  fetchCategoriesAfterDeletion: () => void;
}) => {
  const { setHelperCard } = useHelperCard();
  const [state, formAction, isPending] = useActionState(
    _deleteSubcategory,
    null,
  );
  const [pageState, setPageState] = useState<"FORM" | "SUCCESS" | "ERROR">(
    "FORM",
  );
  useEffect(() => {
    if (state?.statusCode === 200) {
      setPageState("SUCCESS");
      setHelperCard({
        show: true,
        helperCardType: "CONFIRM",
        content: <>Subcategoria excluída!</>,
      });
      fetchCategoriesAfterDeletion();
    } else if (state?.statusCode === 401) {
      setHelperCard({
        show: true,
        helperCardType: "ERROR",
        content: <>Não possui permissão para excluir subcategoria!</>,
      });
    } else if (state?.statusCode === 409 || state?.statusCode === 500) {
      setHelperCard({
        show: true,
        helperCardType: "ERROR",
        content: <>Erro ao excluir subcategoria!</>,
      });
      setPageState("ERROR");
    }
  }, [state, fetchCategoriesAfterDeletion, setHelperCard]);
  return (
    <DialogTrigger
      onOpenChange={() => {
        setPageState("FORM");
      }}
    >
      <Button
        className="items-center p-2 text-sm sm:text-xl"
        variant={"destructive"}
      >
        <IconTrash />
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
                      Apagar subcategoria
                    </h4>
                    <Button
                      className="ml-auto text-black"
                      variant={"ghost"}
                      size={"icon"}
                      onPress={() => {
                        setPageState("FORM");
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
                        {subcategoryName}
                      </h5>
                      <span className="text-gray-800">
                        {" "}
                        {`Categoria: ${categoryName}`}
                      </span>
                      <h6 className="font-semibold text-red-500">
                        Aviso: Esta ação também excluirá questões associadas!
                      </h6>
                      <input
                        type="hidden"
                        id="subcategoryId"
                        name="subcategoryId"
                        value={subcategoryId}
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
                      <h5 className="text-center text-xl font-semibold text-green-500">
                        {`Categoria "${state?.content.subcategoryName}" excluída!`}
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
                          {`Esta subcategoria possui ${
                            state.content.formsWithQuestions.reduce(
                              (acc, f) => {
                                f.questions.forEach((q) => acc.add(q.id));
                                return acc;
                              },
                              new Set(),
                            ).size
                          } ${state.content.formsWithQuestions[0]?.questions.length === 1 ? "questão" : "questões"} em formulários!`}
                        </h5>
                      )}

                      <div className="flex justify-center">
                        <IconX className="h-32 w-32 text-2xl text-red-500" />
                      </div>
                      {state?.content.formsWithQuestions &&
                        state?.content.formsWithQuestions.length >= 1 && (
                          <>
                            <h6 className="text-xl font-semibold">
                              Formulários:
                            </h6>
                            <ul className="list-inside list-decimal break-words pl-3 font-semibold">
                              {state?.content.formsWithQuestions.map((f) => {
                                return (
                                  <li key={f.id}>
                                    {`${f.name}, versão ${f.version}`}
                                    <ul className="list-inside list-disc pl-6 font-normal">
                                      {f.questions.map((q) => {
                                        return <li key={q.id}>{q.name}</li>;
                                      })}
                                    </ul>
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

export { SubcategoryDeletionModal };
