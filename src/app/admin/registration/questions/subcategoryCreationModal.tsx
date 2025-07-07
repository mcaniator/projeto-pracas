"use client";

import { Button } from "@/components/button";
import LoadingIcon from "@components/LoadingIcon";
import { useHelperCard } from "@components/context/helperCardContext";
import { Input } from "@components/ui/input";
import { subcategorySubmit } from "@serverActions/categoryUtil";
import { IconCheck, IconCirclePlus, IconX } from "@tabler/icons-react";
import { useActionState, useEffect, useState } from "react";
import {
  Dialog,
  DialogTrigger,
  Modal,
  ModalOverlay,
} from "react-aria-components";

const SubcategoryCreationModal = ({
  categoryId,
  categoryName,
  fetchCategoriesAfterCreation,
}: {
  categoryId: number;
  categoryName: string | undefined;
  fetchCategoriesAfterCreation: () => void;
}) => {
  const { setHelperCard } = useHelperCard();
  const initialState = {
    statusCode: 0,
    subcategoryName: null,
  };
  const [state, formAction, isPending] = useActionState(
    subcategorySubmit,
    initialState,
  );
  const [pageState, setPageState] = useState<"FORM" | "SUCCESS" | "ERROR">(
    "FORM",
  );
  const [isOpen, setIsOpen] = useState(false);

  const resetModal = () => {
    setPageState("FORM");
  };

  useEffect(() => {
    if (state.statusCode === 201) {
      setPageState("SUCCESS");
      setHelperCard({
        show: true,
        helperCardType: "CONFIRM",
        content: <>Subcategoria criada!</>,
      });
      fetchCategoriesAfterCreation();
    } else if (state.statusCode === 401) {
      setPageState("ERROR");
      setHelperCard({
        show: true,
        helperCardType: "ERROR",
        content: <>Não possui permissão para criar subcategoria!</>,
      });
    } else if (state.statusCode === 400 || state.statusCode === 500) {
      setHelperCard({
        show: true,
        helperCardType: "ERROR",
        content: <>Erro ao criar subcategoria!</>,
      });
      setPageState("ERROR");
    }
  }, [state, fetchCategoriesAfterCreation, setHelperCard]);

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
              `w-[90%] max-w-lg overflow-scroll rounded-2xl bg-off-white p-6 text-left align-middle shadow-xl ${
                isEntering ? "duration-300 ease-out animate-in zoom-in-95" : ""
              } ${isExiting ? "duration-200 ease-in animate-out zoom-out-95" : ""}`
            }
          >
            <Dialog className="outline-none data-[focus-visible]:outline data-[focus-visible]:ring-1 data-[focus-visible]:ring-ring">
              {({ close }) => (
                <div className="flex flex-col gap-2">
                  <div className="flex">
                    <h4 className="text-2xl font-semibold sm:text-4xl">
                      Criar subcategoria
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
                  <h5 className="text-base font-semibold text-gray-600 sm:text-xl">{`Categoria: ${categoryName}`}</h5>
                  {isPending && (
                    <div className="flex justify-center">
                      <LoadingIcon className="h-32 w-32 text-2xl" />
                    </div>
                  )}
                  {!isPending && pageState === "FORM" && (
                    <form
                      action={formAction}
                      className="flex h-full w-full flex-col rounded-l"
                    >
                      <input
                        type="hidden"
                        id="category-id"
                        name="category-id"
                        value={categoryId}
                      />
                      <label
                        htmlFor="subacategory-name"
                        className="text-base font-semibold sm:text-xl"
                      >
                        Nome da subcategoria
                      </label>
                      <Input
                        required
                        id="subcategory-name"
                        name="subcategory-name"
                        className={`${state.statusCode === 409 ? "w-full outline outline-2 outline-red-500" : "w-full"}`}
                      ></Input>
                      {state.statusCode === 409 && (
                        <p className="text-red-500">
                          {`Esta subcategoria já existe na categoria "${categoryName}"!`}
                        </p>
                      )}
                      <div className="mt-3 flex justify-end">
                        <Button variant={"constructive"} type="submit">
                          Criar
                        </Button>
                      </div>
                    </form>
                  )}
                  {pageState === "SUCCESS" && (
                    <div className="flex flex-col items-center">
                      <h5 className="text-center text-xl font-semibold">
                        {`Categoria "${state.subcategoryName}" criada!`}
                      </h5>
                      <div className="flex justify-center">
                        <IconCheck className="h-32 w-32 text-2xl text-green-500" />
                      </div>
                      <Button onPress={resetModal}>
                        Cria nova subcategoria
                      </Button>
                    </div>
                  )}
                  {pageState === "ERROR" && (
                    <div className="flex flex-col items-center">
                      <h5 className="text-center text-xl font-semibold">
                        Algo deu errado!
                      </h5>
                      <div className="flex justify-center">
                        <IconX className="h-32 w-32 text-2xl text-red-500" />
                      </div>
                      <Button onPress={resetModal}>Tentar novamente</Button>
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

export { SubcategoryCreationModal };
