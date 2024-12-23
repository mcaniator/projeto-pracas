"use client";

import { Button } from "@/components/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { RadioButton } from "@/components/ui/radioButton";
import { Select } from "@/components/ui/select";
import { questionSubmit } from "@/serverActions/questionSubmit";
import { IconTrashX } from "@tabler/icons-react";
import { useActionState, useEffect, useRef, useState } from "react";
import React from "react";

const initialState = {
  statusCode: 0,
};
interface AvaliableSubcategories {
  id: number;
  categoryId: number;
  name: string;
  active: boolean;
  optional: boolean;
}
type CharacterType = "text" | "number";
const QuestionForm = ({
  availableCategories,
  availableSubcategories,
}: {
  availableCategories: { id: number; name: string }[];
  availableSubcategories: AvaliableSubcategories[];
}) => {
  const [, formAction] = useActionState(questionSubmit, initialState);

  const [currentCategoryId, setCurrentCategoryId] = useState<
    number | undefined
  >(availableCategories[0]?.id);

  const [type, setType] = useState("");
  const [characterType, setCharacterType] = useState<CharacterType | null>();
  const [optionType, setOptionType] = useState("RADIO");
  const [hasAssocieatedGeometry, setHasAssociatedGeometry] =
    useState<boolean>(false);
  const [geometryTypes, setGeometryTypes] = useState<string[]>(["POINT"]);
  const [currentOption, setCurrentOption] = useState("");
  const [addedOptions, setAddedOptions] = useState<{ text: string }[]>();

  const formRef = useRef<HTMLFormElement>(null);

  const [disabled, setDisabled] = useState(false);

  useEffect(() => {
    setDisabled(addedOptions == undefined && type == "option");
  }, [addedOptions, type]);
  useEffect(() => {
    setCurrentCategoryId(availableCategories[0]?.id);
  }, [availableCategories]);

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCurrentCategoryId(Number(e.target.value));
  };

  const handleGeometryTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      if (!geometryTypes.includes(e.target.value)) {
        setGeometryTypes((prev) => [...prev, e.target.value]);
      }
    } else if (geometryTypes.length > 1) {
      setGeometryTypes((prev) => prev.filter((p) => p !== e.target.value));
    }
  };
  // TODO: add error handling
  return (
    <form
      ref={formRef}
      action={formAction}
      className={"flex min-h-0 flex-grow text-lg"}
      onSubmit={() =>
        // for some reason this timeout is needed otherwise the inputs are cleared before they're sent to the server
        setTimeout(() => {
          formRef.current?.reset();
          setType("");
          setAddedOptions(undefined);
          setHasAssociatedGeometry(false);
        }, 1)
      }
    >
      <div className={"flex basis-1/3 flex-col gap-2 pr-5"}>
        <div>
          <label htmlFor={"categories"}>Categoria</label>
          <Select
            name="categoryId"
            id={"categories"}
            onChange={(e) => handleCategoryChange(e)}
          >
            {availableCategories.map((value, index) => (
              <option key={index} value={value.id}>
                {value.name}
              </option>
            ))}
          </Select>
        </div>
        {currentCategoryId &&
          availableCategories &&
          availableSubcategories.some(
            (subcategory) => subcategory.categoryId === currentCategoryId,
          ) && (
            <React.Fragment>
              <label htmlFor="subcategories">Subcategoria</label>
              <Select name="subcategoryId" id="subcategories">
                <option value={-1}>Nenhuma</option>
                {availableSubcategories
                  .filter(
                    (subcategory) =>
                      subcategory.categoryId === currentCategoryId,
                  )
                  .map((value, index) => (
                    <option key={index} value={value.id}>
                      {value.name}
                    </option>
                  ))}
              </Select>
            </React.Fragment>
          )}
        <div>
          <label htmlFor={"question"}>Pergunta:</label>
          <Input type="text" name="name" id={"question"} required />
        </div>

        <div className={"flex flex-col"}>
          <h4>Tipo de pergunta:</h4>
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
          <h4>Possui geometria associada?</h4>
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
              checked={hasAssocieatedGeometry}
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
              checked={!hasAssocieatedGeometry}
              required
            >
              Não
            </RadioButton>
          </div>
        </div>
        {hasAssocieatedGeometry && (
          <div className="flex flex-col">
            <h4>Selecione os tipos de geometria aceitos:</h4>
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
      </div>

      <div className={"flex basis-1/3 flex-col gap-2 pr-5"}>
        {type == "written" && (
          <div>
            <div>
              <label htmlFor={"text"}>Tipo de caracteres:</label>
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
            {characterType === "text" && (
              <div>
                <label htmlFor={"charLimit"}>Limite de caracteres:</label>
                <Input type="number" name={"charLimit"} id={"charLimit"} />
              </div>
            )}
            {characterType === "number" && (
              <div>
                <div>
                  <label htmlFor={"minValue"}>Valor mínimo:</label>
                  <Input type="number" name={"minValue"} id={"minValue"} />
                </div>
                <div>
                  <label htmlFor={"maxValue"}>Valor máximo:</label>
                  <Input type="number" name={"maxValue"} id={"maxValue"} />
                </div>
              </div>
            )}
          </div>
        )}

        {type == "option" && (
          <>
            <div>
              <label htmlFor={"tipoSelecao"}>Tipo de seleção:</label>
              <Select
                name={"optionType"}
                onChange={(e) => {
                  setOptionType(e.target.value);
                }}
                id={"tipoSelecao"}
              >
                <option value={"RADIO"}>Botões Radias</option>
                <option value={"CHECKBOX"}>Caixa de Checagem</option>
              </Select>
            </div>

            <div>
              <label htmlFor={"text"}>Tipo de caracteres:</label>
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
              <div className={"flex flex-col gap-2"}>
                <div>
                  <label htmlFor={"opcao"}>Digite as suas opções:</label>
                  <Input
                    id={"opcao"}
                    type={characterType}
                    value={currentOption}
                    onChange={(e) => {
                      setCurrentOption(e.target.value);
                    }}
                  />
                </div>
                <Button
                  type="button"
                  variant={"admin"}
                  isDisabled={currentOption == ""}
                  onPress={() => {
                    if (addedOptions != undefined)
                      setAddedOptions([
                        ...addedOptions,
                        { text: currentOption },
                      ]);
                    else setAddedOptions([{ text: currentOption }]);

                    setCurrentOption("");
                  }}
                  className={"transition-all"}
                >
                  Adicionar
                </Button>
              </div>
            )}

            {optionType == "CHECKBOX" && (
              <div>
                <label htmlFor={"optionLimit"}>Máximo de seleções:</label>
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

        {type && characterType !== null && (
          <Button
            isDisabled={disabled}
            variant={"admin"}
            type="submit"
            className={"w-24 transition-all"}
          >
            Enviar
          </Button>
        )}
      </div>

      {addedOptions && addedOptions.length != 0 && (
        <div className={"flex basis-1/3 flex-col"}>
          <p>Opções atuais:</p>
          <div
            className={
              "max-h-full w-full overflow-scroll rounded-lg border-2 border-gray-500/40 bg-gray-400/50 py-1 pl-3 pr-2 text-lg"
            }
          >
            <div>
              {addedOptions.map((value, index) => (
                <div key={index} className={"flex items-center"}>
                  <p className={"-mb-1"}>{value.text}</p>
                  <Button
                    variant={"ghost"}
                    size={"icon"}
                    className={"ml-auto h-7 w-7"}
                    type={"button"}
                    onPress={() => {
                      if (addedOptions.length == 1) setAddedOptions(undefined);
                      else setAddedOptions(addedOptions.toSpliced(index, 1));
                    }}
                  >
                    <IconTrashX size={20} />
                  </Button>
                  <input type="hidden" name="options" value={value.text} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </form>
  );
};

export { QuestionForm };
