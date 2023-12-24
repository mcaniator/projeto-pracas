"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioButton } from "@/components/ui/radioButton";
import { Select } from "@/components/ui/select";
import { questionSubmit } from "@/lib/serverActions/questionSubmit";
import { IconTrashX } from "@tabler/icons-react";
import { useEffect, useRef, useState } from "react";
import { useFormState } from "react-dom";

const initialState = {
  statusCode: 0,
};

const QuestionForm = ({ availableCategories }: { availableCategories: { id: number; name: string }[] }) => {
  const [, formAction] = useFormState(questionSubmit, initialState);

  const [type, setType] = useState("");
  const [optionType, setOptionType] = useState("SELECTION");

  const [currentOption, setCurrentOption] = useState("");
  const [addedOptions, setAddedOptions] = useState<{ text: string }[]>();

  const formRef = useRef<HTMLFormElement>(null);

  const [disabled, setDisabled] = useState(false);

  useEffect(() => {
    setDisabled(addedOptions == undefined && type == "option");
  }, [addedOptions, type]);

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
        }, 1)
      }
    >
      <div className={"flex basis-1/3 flex-col gap-2 pr-5"}>
        <div>
          <label htmlFor={"categories"}>Categoria</label>
          <Select name="categoryId" id={"categories"}>
            {availableCategories.map((value, index) => (
              <option key={index} value={value.id}>
                {value.name}
              </option>
            ))}
          </Select>
        </div>

        <div>
          <label htmlFor={"question"}>Pergunta:</label>
          <Input type="text" name="name" id={"question"} required />
        </div>

        <div className={"flex flex-col"}>
          <label htmlFor={"text"}>Tipo de pergunta:</label>
          <div className={"flex flex-col gap-1 rounded-lg border-2 border-off-white/80 bg-gray-400/50 px-2 py-1 shadow-md"}>
            <RadioButton
              type={"radio"}
              variant={"admin"}
              id={"text"}
              value={"TEXT"}
              name="questionType"
              onClick={() => {
                setType("text");
                setAddedOptions(undefined);
              }}
              className={"border-white"}
              required
            >
              Texto
            </RadioButton>
            <RadioButton
              type="radio"
              variant={"admin"}
              id="numeric"
              value={"NUMERIC"}
              name="questionType"
              onClick={() => {
                setType("numeric");
                setAddedOptions(undefined);
              }}
              className={"border-white"}
              required
            >
              Numérico
            </RadioButton>
            <RadioButton
              type="radio"
              variant={"admin"}
              id="option"
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
      </div>

      <div className={"flex basis-1/3 flex-col gap-2 pr-5"}>
        {type == "text" && (
          <div>
            <label htmlFor={"charLimit"}>Limite de caracteres:</label>
            <Input type="number" name={"charLimit"} id={"charLimit"} required />
          </div>
        )}

        {type == "numeric" && (
          <>
            <div>
              <label htmlFor={"min"}>Valor mínimo:</label>
              <Input type="number" name={"min"} id={"min"} required />
            </div>
            <div>
              <label htmlFor={"max"}>Valor máximo:</label>
              <Input type="number" name={"max"} id={"max"} required />
            </div>
          </>
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
                <option value={"SELECTION"}>Caixa de Seleção</option>
                <option value={"RADIO"}>Botões Radias</option>
                <option value={"CHECKBOX"}>Caixa de Checagem</option>
              </Select>
            </div>

            <div className={"flex flex-col gap-2"}>
              <div>
                <label htmlFor={"opcao"}>Digite as suas opções:</label>
                <Input
                  id={"opcao"}
                  type="text"
                  value={currentOption}
                  onChange={(e) => {
                    setCurrentOption(e.target.value);
                  }}
                />
              </div>
              <Button
                type="button"
                variant={"admin"}
                aria-disabled={(() => {
                  return currentOption == "";
                })()}
                onClick={() => {
                  if (addedOptions != undefined) setAddedOptions([...addedOptions, { text: currentOption }]);
                  else setAddedOptions([{ text: currentOption }]);

                  setCurrentOption("");
                }}
                className={"transition-all"}
              >
                Adicionar
              </Button>
            </div>

            {optionType == "CHECKBOX" && (
              <div>
                <label htmlFor={"optionLimit"}>Máximo de seleções:</label>
                <Input type="number" name="maximumSelection" id={"optionLimit"} required />
              </div>
            )}
          </>
        )}

        {type && (
          <Button aria-disabled={disabled} variant={"admin"} type="submit" className={"w-24 transition-all"}>
            Enviar
          </Button>
        )}
      </div>

      {addedOptions && addedOptions.length != 0 && (
        <div className={"flex basis-1/3 flex-col"}>
          <p>Opções atuais:</p>
          <div className={"max-h-full w-full overflow-scroll rounded-lg border-2 border-gray-500/40 bg-gray-400/50 py-1 pl-3 pr-2 text-lg"}>
            <div>
              {addedOptions.map((value, index) => (
                <div key={index} className={"flex items-center"}>
                  <p className={"-mb-1"}>{value.text}</p>
                  <Button
                    variant={"ghost"}
                    size={"icon"}
                    className={"ml-auto h-7 w-7"}
                    type={"button"}
                    onClick={() => {
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
