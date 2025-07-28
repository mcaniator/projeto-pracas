"use client";

import { Button } from "@/components/button";
import LoadingIcon from "@components/LoadingIcon";
import { useHelperCard } from "@components/context/helperCardContext";
import { Checkbox } from "@components/ui/checkbox";
import { Input } from "@components/ui/input";
import { RadioButton } from "@components/ui/radioButton";
import { Select } from "@components/ui/select";
import { _questionSubmit } from "@serverActions/questionUtil";
import {
  IconCheck,
  IconCirclePlus,
  IconTrash,
  IconX,
} from "@tabler/icons-react";
import { startTransition, useActionState, useEffect, useState } from "react";
import {
  Dialog,
  DialogTrigger,
  Modal,
  ModalOverlay,
} from "react-aria-components";

type CharacterType = "text" | "number";

const QuestionCreationModal = ({
  categoryId,
  categoryName,
  subcategoryId,
  subcategoryName,
  fetchCategoriesAfterCreation,
}: {
  categoryId: number | undefined;
  categoryName: string | undefined;
  subcategoryId: number | undefined;
  subcategoryName: string | undefined;
  fetchCategoriesAfterCreation: () => Promise<void>;
}) => {
  const { setHelperCard } = useHelperCard();
  const [state, formAction, isPending] = useActionState(_questionSubmit, null);
  const [pageState, setPageState] = useState<"FORM" | "SUCCESS" | "ERROR">(
    "FORM",
  );
  const [isOpen, setIsOpen] = useState(false);
  const [type, setType] = useState("");
  const [characterType, setCharacterType] = useState<CharacterType | null>();
  const [optionType, setOptionType] = useState("RADIO");
  const [hasAssociatedGeometry, setHasAssociatedGeometry] =
    useState<boolean>(false);
  const [geometryTypes, setGeometryTypes] = useState<string[]>([]);
  const [currentOption, setCurrentOption] = useState("");
  const [addedOptions, setAddedOptions] = useState<{ text: string }[]>();
  const [minumumOptionsError, setMinimumOptionsError] = useState(false);
  const handleScale = (isChecked: boolean) => {
    if (isChecked) {
      if (!addedOptions?.some((option) => option.text === "Péssimo")) {
        setAddedOptions((prevOptions) => [
          ...(prevOptions || []),
          { text: "Péssimo" },
          { text: "Ruim" },
          { text: "Bom" },
          { text: "Ótimo" },
        ]);
      }
    } else {
      setAddedOptions((prevOptions) =>
        prevOptions?.filter(
          (option) =>
            option.text !== "Péssimo" &&
            option.text !== "Ruim" &&
            option.text !== "Bom" &&
            option.text !== "Ótimo",
        ),
      );
    }
  };
  const handleYesNoOptions = (isChecked: boolean) => {
    if (isChecked) {
      if (!addedOptions?.some((option) => option.text === "Sim")) {
        setAddedOptions((prevOptions) => [
          ...(prevOptions || []),
          { text: "Sim" },
          { text: "Não" },
        ]);
      }
    } else {
      setAddedOptions((prevOptions) =>
        prevOptions?.filter(
          (option) => option.text !== "Sim" && option.text !== "Não",
        ),
      );
    }
  };
  const resetModal = () => {
    setType("");
    setCharacterType(null);
    setCurrentOption("");
    setHasAssociatedGeometry(false);
    setAddedOptions(undefined);
    setGeometryTypes([]);
    setPageState("FORM");
  };
  useEffect(() => {
    if (state?.statusCode === 201) {
      setPageState("SUCCESS");
      setHelperCard({
        show: true,
        helperCardType: "CONFIRM",
        content: <>Questão registrada!</>,
      });
    } else if (state?.statusCode === 401) {
      setHelperCard({
        show: true,
        helperCardType: "ERROR",
        content: <>Sem permissão para registrar questões!</>,
      });
      setPageState("ERROR");
    } else if (state?.statusCode === 400 || state?.statusCode === 500) {
      setHelperCard({
        show: true,
        helperCardType: "ERROR",
        content: <>Erro ao registar questão!</>,
      });
      setPageState("ERROR");
    }
  }, [state, setHelperCard]);

  useEffect(() => {
    if (state?.statusCode === 201) {
      void fetchCategoriesAfterCreation();
    }
  }, [state, fetchCategoriesAfterCreation]);
  const handleGeometryTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      if (!geometryTypes.includes(e.target.value)) {
        setGeometryTypes((prev) => [...prev, e.target.value]);
      }
    } else if (geometryTypes.length > 1) {
      setGeometryTypes((prev) => prev.filter((p) => p !== e.target.value));
    }
  };
  const handleRemoveOption = (option: string) => {
    setAddedOptions((prev) => prev?.filter((p) => p.text !== option));
  };

  useEffect(() => {
    setAddedOptions(undefined);
  }, [characterType, type]);
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
              `mb-auto mt-auto w-[90%] max-w-lg overflow-auto rounded-2xl bg-off-white p-6 text-left align-middle shadow-xl ${
                isEntering ? "duration-300 ease-out animate-in zoom-in-95" : ""
              } ${isExiting ? "duration-200 ease-in animate-out zoom-out-95" : ""}`
            }
          >
            <Dialog className="outline-none data-[focus-visible]:outline data-[focus-visible]:ring-1 data-[focus-visible]:ring-ring">
              {({ close }) => (
                <div className="flex flex-col gap-2">
                  <div className="flex">
                    <h4 className="text-2xl font-semibold sm:text-4xl">
                      Criar questão
                    </h4>
                    <Button
                      className="ml-auto text-black"
                      variant={"ghost"}
                      size={"icon"}
                      onPress={() => {
                        setPageState("FORM");
                        setType("");
                        setCharacterType(null);
                        setCurrentOption("");
                        setAddedOptions(undefined);
                        setGeometryTypes([]);
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
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (
                          type === "OPTIONS" &&
                          (!addedOptions || addedOptions.length === 0)
                        ) {
                          setMinimumOptionsError(true);
                          return;
                        }
                        if (
                          hasAssociatedGeometry &&
                          geometryTypes.length === 0
                        ) {
                          setHelperCard({
                            show: true,
                            helperCardType: "ERROR",
                            content: <>Nenhum tipo de geometria selecionado!</>,
                          });
                          return;
                        }
                        const formData = new FormData(e.currentTarget);
                        startTransition(() => formAction(formData));
                      }}
                      className="flex w-full flex-col rounded-l"
                    >
                      <h5 className="text-base font-semibold sm:text-xl">
                        {`Categoria: ${categoryName}`}
                      </h5>
                      <h6 className="my-2 text-base font-semibold sm:text-xl">
                        {subcategoryName ?
                          `Subcategoria: ${subcategoryName}`
                        : "SEM SUBCATEGORIA"}
                      </h6>
                      <input
                        type="hidden"
                        id="categoryId"
                        name="categoryId"
                        value={categoryId}
                      />
                      <input
                        type="hidden"
                        id="subcategoryId"
                        name="subcategoryId"
                        value={subcategoryId}
                      />
                      <div className="flex flex-col gap-2">
                        <div>
                          <label htmlFor="question" className="font-semibold">
                            Título
                          </label>
                          <Input
                            className="w-full"
                            type="text"
                            name="name"
                            id="question"
                            required
                          />
                        </div>
                        <div>
                          <label htmlFor="notes">Observações</label>
                          <Input
                            className="w-full"
                            type="text"
                            name="notes"
                            id="notes"
                          />
                        </div>
                        <div className={"flex flex-col"}>
                          <h4 className="font-semibold">Tipo de pergunta:</h4>
                          <div
                            className={
                              "flex flex-col gap-1 rounded-lg border-2 border-off-white/80 bg-gray-400/50 px-2 py-1 shadow-md"
                            }
                          >
                            <RadioButton
                              type={"radio"}
                              id={"text"}
                              value={"WRITTEN"}
                              checked={type === "WRITTEN"}
                              name="questionType"
                              onChange={(e) => {
                                setType(e.target.value);
                              }}
                              className={"border-white"}
                              required
                            >
                              Escrito
                            </RadioButton>
                            <RadioButton
                              type="radio"
                              id="numeric"
                              value={"OPTIONS"}
                              checked={type === "OPTIONS"}
                              name="questionType"
                              onChange={(e) => {
                                setType(e.target.value);
                              }}
                              className={"border-white"}
                              required
                            >
                              Opção
                            </RadioButton>
                          </div>
                        </div>
                        <div className={"flex flex-col"}>
                          <h4 className="font-semibold">
                            Possui geometria associada?
                          </h4>
                          <div
                            className={
                              "flex flex-col gap-1 rounded-lg border-2 border-off-white/80 bg-gray-400/50 px-2 py-1 shadow-md"
                            }
                          >
                            <RadioButton
                              type={"radio"}
                              id={"hasGeometry"}
                              value={"true"}
                              name="hasAssociatedGeometry"
                              onChange={() => {
                                setHasAssociatedGeometry(true);
                              }}
                              className={"border-white"}
                              checked={hasAssociatedGeometry}
                              required
                            >
                              Sim
                            </RadioButton>
                            <RadioButton
                              type="radio"
                              id="noGeometry"
                              value={"false"}
                              name="hasAssociatedGeometry"
                              onChange={() => {
                                setHasAssociatedGeometry(false);
                              }}
                              className={"border-white"}
                              checked={!hasAssociatedGeometry}
                              required
                            >
                              Não
                            </RadioButton>
                          </div>
                        </div>
                        {hasAssociatedGeometry && (
                          <div className="flex flex-col">
                            <h4 className="font-semibold">
                              Selecione os tipos de geometria aceitos:
                            </h4>
                            <div
                              className={
                                "flex flex-col gap-1 rounded-lg border-2 border-off-white/80 bg-gray-400/50 px-2 py-1 shadow-md"
                              }
                            >
                              <Checkbox
                                value={"POINT"}
                                name="geometryTypes"
                                checked={geometryTypes.includes("POINT")}
                                onChange={(e) => handleGeometryTypeChange(e)}
                              >
                                Ponto
                              </Checkbox>
                              <Checkbox
                                value={"POLYGON"}
                                name="geometryTypes"
                                checked={geometryTypes.includes("POLYGON")}
                                onChange={(e) => handleGeometryTypeChange(e)}
                              >
                                Polígono
                              </Checkbox>
                            </div>
                          </div>
                        )}

                        <div className={"flex flex-col gap-2"}>
                          {type == "WRITTEN" && (
                            <div>
                              <div>
                                <label
                                  htmlFor={"text"}
                                  className="font-semibold"
                                >
                                  Tipo de caracteres:
                                </label>
                                <div
                                  className={
                                    "flex flex-col gap-1 rounded-lg border-2 border-off-white/80 bg-gray-400/50 px-2 py-1 shadow-md"
                                  }
                                >
                                  <RadioButton
                                    name="characterType"
                                    value={"TEXT"}
                                    onChange={() => setCharacterType("text")}
                                    checked={characterType === "text"}
                                    required
                                  >
                                    Texto
                                  </RadioButton>
                                  <RadioButton
                                    name="characterType"
                                    value={"NUMBER"}
                                    onChange={() => setCharacterType("number")}
                                    checked={characterType === "number"}
                                    required
                                  >
                                    Numérico
                                  </RadioButton>
                                </div>
                              </div>
                            </div>
                          )}

                          {type == "OPTIONS" && (
                            <>
                              <div>
                                <label
                                  htmlFor={"tipoSelecao"}
                                  className="font-semibold"
                                >
                                  Tipo de seleção:
                                </label>
                                <Select
                                  name={"optionType"}
                                  onChange={(e) => {
                                    setOptionType(e.target.value);
                                  }}
                                  id={"tipoSelecao"}
                                >
                                  <option value={"RADIO"}>Botões Radias</option>
                                  <option value={"CHECKBOX"}>
                                    Caixa de Checagem
                                  </option>
                                </Select>
                              </div>

                              <div>
                                <label
                                  htmlFor={"text"}
                                  className="font-semibold"
                                >
                                  Tipo de caracteres:
                                </label>
                                <div
                                  className={
                                    "flex flex-col gap-1 rounded-lg border-2 border-off-white/80 bg-gray-400/50 px-2 py-1 shadow-md"
                                  }
                                >
                                  <RadioButton
                                    name="characterType"
                                    value={"TEXT"}
                                    onChange={() => setCharacterType("text")}
                                    checked={characterType === "text"}
                                    required
                                  >
                                    Texto
                                  </RadioButton>
                                  <RadioButton
                                    name="characterType"
                                    value={"NUMBER"}
                                    onChange={() => setCharacterType("number")}
                                    checked={characterType === "number"}
                                    required
                                  >
                                    Numérico
                                  </RadioButton>
                                </div>
                              </div>
                              {characterType && (
                                <div className={"flex flex-col"}>
                                  {characterType === "text" && (
                                    <>
                                      <Checkbox
                                        id={"escala"}
                                        variant={"default"}
                                        onChange={(e) => {
                                          handleScale(e.target.checked);
                                        }}
                                      >
                                        Escala de qualidade
                                      </Checkbox>
                                      <Checkbox
                                        id={"simNao"}
                                        variant={"default"}
                                        onChange={(e) => {
                                          handleYesNoOptions(e.target.checked);
                                        }}
                                      >
                                        Sim ou não
                                      </Checkbox>
                                    </>
                                  )}

                                  <label
                                    htmlFor={"opcao"}
                                    className="font-semibold"
                                  >
                                    Digite as suas opções:
                                  </label>
                                  <Input
                                    className="w-full"
                                    id={"opcao"}
                                    type={characterType}
                                    value={currentOption}
                                    onChange={(e) => {
                                      setCurrentOption(e.target.value);
                                    }}
                                  />
                                  {minumumOptionsError && (
                                    <p className="text-red-500">
                                      Adicione pelo menos uma opção!
                                    </p>
                                  )}
                                  <div className="mt-1">
                                    <Button
                                      type="button"
                                      variant={"admin"}
                                      isDisabled={currentOption == ""}
                                      onPress={() => {
                                        if (addedOptions != undefined) {
                                          if (
                                            !addedOptions.some(
                                              (opt) =>
                                                opt.text === currentOption,
                                            )
                                          )
                                            setAddedOptions([
                                              ...addedOptions,
                                              { text: currentOption },
                                            ]);
                                        } else
                                          setAddedOptions([
                                            { text: currentOption },
                                          ]);

                                        setCurrentOption("");
                                      }}
                                      className={"text-white transition-all"}
                                    >
                                      Adicionar
                                    </Button>
                                    <div className="font-semibold">Opções:</div>
                                    <ul className="list-inside list-disc space-y-2 pl-2">
                                      {addedOptions?.map((option) => {
                                        return (
                                          <li
                                            key={option.text}
                                            className="flex items-center rounded-md bg-white p-2"
                                          >
                                            {option.text}
                                            <Button
                                              className="ml-auto px-2"
                                              variant={"destructive"}
                                              onPress={() =>
                                                handleRemoveOption(option.text)
                                              }
                                            >
                                              <IconTrash />
                                            </Button>
                                            <input
                                              type="hidden"
                                              name="options"
                                              value={option.text}
                                            />
                                          </li>
                                        );
                                      })}
                                    </ul>
                                  </div>
                                </div>
                              )}

                              {optionType == "CHECKBOX" && (
                                <div>
                                  <label
                                    htmlFor={"optionLimit"}
                                    className="font-semibold"
                                  >
                                    Máximo de seleções:
                                  </label>
                                  <Input
                                    className="w-full"
                                    type="number"
                                    name="maximumSelection"
                                    id={"optionLimit"}
                                    required
                                  />
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                      {type && characterType !== null && (
                        <div className="mt-auto flex justify-end py-5">
                          <Button
                            variant={"constructive"}
                            type="submit"
                            className={"w-24 transition-all"}
                          >
                            Criar
                          </Button>
                        </div>
                      )}
                    </form>
                  )}
                  {pageState === "SUCCESS" && (
                    <div className="flex flex-col items-center">
                      <h5 className="text-center text-xl font-semibold">
                        {`Questão "${state?.questionName}" criada!`}
                      </h5>
                      <div className="flex justify-center">
                        <IconCheck className="h-32 w-32 text-2xl text-green-500" />
                      </div>
                      <Button onPress={resetModal}>Criar nova questão</Button>
                    </div>
                  )}
                  {pageState === "ERROR" && (
                    <div className="flex flex-col items-center">
                      {state?.statusCode === 500 && (
                        <h5 className="text-center text-xl font-semibold">
                          Algo deu errado!
                        </h5>
                      )}

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

export { QuestionCreationModal };
