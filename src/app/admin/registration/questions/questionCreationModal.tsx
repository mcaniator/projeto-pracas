"use client";

import { Button } from "@/components/button";
import { IconCheck, IconTrash, IconX } from "@tabler/icons-react";
import { useActionState, useEffect, useState } from "react";
import {
  Dialog,
  DialogTrigger,
  Modal,
  ModalOverlay,
} from "react-aria-components";

import LoadingIcon from "../../../../components/LoadingIcon";
import { Checkbox } from "../../../../components/ui/checkbox";
import { Input } from "../../../../components/ui/input";
import { RadioButton } from "../../../../components/ui/radioButton";
import { Select } from "../../../../components/ui/select";
import { questionSubmit } from "../../../../serverActions/questionSubmit";

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
  fetchCategoriesAfterCreation: () => void;
}) => {
  const [state, formAction, isPending] = useActionState(questionSubmit, null);
  const [pageState, setPageState] = useState<"FORM" | "SUCCESS" | "ERROR">(
    "FORM",
  );
  const [type, setType] = useState("");
  const [characterType, setCharacterType] = useState<CharacterType | null>();
  const [optionType, setOptionType] = useState("RADIO");
  const [hasAssociatedGeometry, setHasAssociatedGeometry] =
    useState<boolean>(false);
  const [geometryTypes, setGeometryTypes] = useState<string[]>(["POINT"]);
  const [currentOption, setCurrentOption] = useState("");
  const [addedOptions, setAddedOptions] = useState<{ text: string }[]>();
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
  useEffect(() => {
    if (state?.statusCode === 201) {
      setPageState("SUCCESS");
      fetchCategoriesAfterCreation();
    } else if (state?.statusCode === 400 || state?.statusCode === 500)
      setPageState("ERROR");
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
  return (
    <DialogTrigger>
      <Button className="items-center p-2">Criar questão</Button>
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
                    <h4 className="text-4xl font-semibold">Criar questão</h4>
                    <Button
                      className="ml-auto"
                      variant={"ghost"}
                      size={"icon"}
                      onPress={() => {
                        setPageState("FORM");
                        setType("");
                        setCharacterType(null);
                        setCurrentOption("");
                        setAddedOptions([]);
                        setGeometryTypes(["Point"]);
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
                      className="flex h-96 w-full flex-col rounded-l"
                    >
                      <h5 className="text-2xl font-semibold">{categoryName}</h5>
                      <h6 className="text-xl font-semibold">
                        {subcategoryName ? subcategoryName : "SEM SUBCATEGORIA"}
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
                            type="text"
                            name="name"
                            id="question"
                            required
                          />
                        </div>
                        <div>
                          <label htmlFor="notes">Observações</label>
                          <Input type="text" name="notes" id="notes" />
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
                              variant={"admin"}
                              id={"text"}
                              value={"WRITTEN"}
                              name="questionType"
                              onClick={() => {
                                setType("written");
                                setAddedOptions(undefined);
                              }}
                              className={"border-white"}
                              required
                            >
                              Escrito
                            </RadioButton>
                            <RadioButton
                              type="radio"
                              variant={"admin"}
                              id="numeric"
                              value={"OPTIONS"}
                              name="questionType"
                              onClick={() => {
                                setType("option");
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
                              variant={"admin"}
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
                              variant={"admin"}
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
                                variant={"admin"}
                                value={"POINT"}
                                name="geometryTypes"
                                checked={geometryTypes.includes("POINT")}
                                onChange={(e) => handleGeometryTypeChange(e)}
                              >
                                Ponto
                              </Checkbox>
                              <Checkbox
                                variant={"admin"}
                                value={"POLYGON"}
                                name="geometryTypes"
                                checked={geometryTypes.includes("POLYGON")}
                                onChange={(e) => handleGeometryTypeChange(e)}
                              >
                                Poligono
                              </Checkbox>
                            </div>
                          </div>
                        )}

                        <div className={"flex flex-col gap-2"}>
                          {type == "written" && (
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
                              {characterType === "number" && (
                                <div>
                                  <div>
                                    <label
                                      htmlFor={"minValue"}
                                      className="font-semibold"
                                    >
                                      Valor mínimo:
                                    </label>
                                    <Input
                                      type="number"
                                      name={"minValue"}
                                      id={"minValue"}
                                    />
                                  </div>
                                  <div>
                                    <label
                                      htmlFor={"maxValue"}
                                      className="font-semibold"
                                    >
                                      Valor máximo:
                                    </label>
                                    <Input
                                      type="number"
                                      name={"maxValue"}
                                      id={"maxValue"}
                                    />
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                          {type == "option" && (
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
                              {characterType !== null && (
                                <div className={"flex flex-col"}>
                                  <Checkbox
                                    id={"escala"}
                                    variant={"default"}
                                    onChange={(e) => {
                                      handleScale(e.target.checked);
                                    }}
                                  >
                                    Escala de qualidade
                                  </Checkbox>
                                  <label
                                    htmlFor={"opcao"}
                                    className="font-semibold"
                                  >
                                    Digite as suas opções:
                                  </label>
                                  <Input
                                    id={"opcao"}
                                    type={characterType}
                                    value={currentOption}
                                    onChange={(e) => {
                                      setCurrentOption(e.target.value);
                                    }}
                                  />
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
                                      className={"transition-all"}
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
                            variant={"admin"}
                            type="submit"
                            className={"w-24 transition-all"}
                          >
                            Enviar
                          </Button>
                        </div>
                      )}
                    </form>
                  )}
                  {pageState === "SUCCESS" && (
                    <div>
                      <h5 className="text-center text-xl font-semibold text-green-500">
                        {`Questão "${state?.questionName}" criada!`}
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

export { QuestionCreationModal };
