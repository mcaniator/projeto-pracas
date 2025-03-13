"use client";

import { Button } from "@/components/button";
import { IconCheck, IconCirclePlus, IconX } from "@tabler/icons-react";
import { useActionState, useEffect, useState } from "react";
import {
  Dialog,
  DialogTrigger,
  Modal,
  ModalOverlay,
} from "react-aria-components";

import LoadingIcon from "../../../../components/LoadingIcon";
import { Input } from "../../../../components/ui/input";
import { categorySubmit } from "../../../../serverActions/categoryUtil";

const CategoryCreationModal = ({
  fetchCategoriesAfterCreation,
}: {
  fetchCategoriesAfterCreation: () => void;
}) => {
  const initialState = {
    statusCode: 0,
    categoryName: null,
  };
  const [state, formAction, isPending] = useActionState(
    categorySubmit,
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
      fetchCategoriesAfterCreation();
    } else if (state.statusCode === 400 || state.statusCode === 500)
      setPageState("ERROR");
  }, [state, fetchCategoriesAfterCreation]);

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
            `fixed inset-0 z-50 flex min-h-full items-center justify-center overflow-y-auto bg-black/25 p-4 text-center backdrop-blur ${
              isEntering ? "duration-300 ease-out animate-in fade-in" : ""
            } ${isExiting ? "duration-200 ease-in animate-out fade-out" : ""}`
          }
          isDismissable
        >
          <Modal
            className={({ isEntering, isExiting }) =>
              `mb-auto mt-auto w-[90%] max-w-lg transform overflow-scroll rounded-2xl bg-off-white p-6 text-left align-middle shadow-xl ${
                isEntering ? "duration-300 ease-out animate-in zoom-in-95" : ""
              } ${isExiting ? "duration-200 ease-in animate-out zoom-out-95" : ""}`
            }
          >
            <Dialog className="outline-none data-[focus-visible]:outline data-[focus-visible]:ring-1 data-[focus-visible]:ring-ring">
              {({ close }) => (
                <div className="flex flex-col gap-2">
                  <div className="flex">
                    <h4 className="text-2xl font-semibold sm:text-4xl">
                      Criar categoria
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
                      <label
                        htmlFor="name"
                        className="text-base font-semibold sm:text-xl"
                      >
                        Nome da categoria
                      </label>
                      <Input
                        required
                        id="name"
                        name="name"
                        className={`${state.statusCode === 409 ? "w-full outline outline-2 outline-red-500" : "w-full"}`}
                      ></Input>
                      {state.statusCode === 409 && (
                        <p className="text-red-500">
                          Esta categoria já existe!
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
                        {`Categoria "${state.categoryName}" criada!`}
                      </h5>
                      <div className="flex justify-center">
                        <IconCheck className="h-32 w-32 text-2xl text-green-500" />
                      </div>
                      <Button onPress={resetModal}>Cria nova categoria</Button>
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

export { CategoryCreationModal };
