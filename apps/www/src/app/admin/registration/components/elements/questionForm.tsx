"use client";

import { questionSubmit } from "@/actions/submission";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import RadioButton from "@/components/ui/radioButton";
import { Select } from "@/components/ui/select";
import { IconTrashX } from "@tabler/icons-react";
import { useEffect, useRef, useState } from "react";
// @ts-expect-error
import { experimental_useFormState as useFormState } from "react-dom";

const initialState = {
  message: null,
};

const QuestionForm = ({ availableCategories }: { availableCategories: { id: number; name: string }[] }) => {
  const [, formAction] = useFormState(questionSubmit, initialState);

  const [selectedType, setSelectedType] = useState("");
  const [currentVariant, setCurrentVariant] = useState(0);

  const [currentOption, setCurrentOption] = useState("");
  const [addedOptions, setAddedOptions] = useState<{ name: string }[]>();

  const formRef = useRef<HTMLFormElement>(null);

  const [disabled, setDisabled] = useState(false);

  useEffect(() => {
    setDisabled(selectedType == "option");
  }, [selectedType]);

  useEffect(() => {
    console.log("hello");
    setDisabled(addedOptions == undefined);
  }, [addedOptions]);

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
          setSelectedType("");
          setAddedOptions(undefined);
        }, 1)
      }
    >
      <div className={"flex basis-1/3 flex-col gap-2 pr-5"}>
        <div>
          <label htmlFor={"categorias"}>Categoria</label>
          <Select name="select" id={"categorias"}>
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
          <div className={"rounded-lg border-2 border-gray-500/40 bg-gray-400/50 px-2 py-1"}>
            <RadioButton
              type="radio"
              id="text"
              value="text"
              name="inputType"
              onClick={() => {
                setSelectedType("text");
                setAddedOptions(undefined);
              }}
              className={"border-white"}
              required
            >
              Texto
            </RadioButton>
            <RadioButton
              type="radio"
              id="numeric"
              value="numeric"
              name="inputType"
              onClick={() => {
                setSelectedType("numeric");
                setAddedOptions(undefined);
              }}
              className={"border-white"}
              required
            >
              Numérico
            </RadioButton>
            <RadioButton
              type="radio"
              id="option"
              value="option"
              name="inputType"
              onClick={() => {
                setSelectedType("option");
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
        {selectedType == "text" && (
          <div>
            <label htmlFor={"charLimit"}>Limite de caracteres:</label>
            <Input type="number" name="charLimit" id={"charLimit"} required />
          </div>
        )}

        {selectedType == "numeric" && (
          <>
            <div>
              <label htmlFor={"min"}>Valor mínimo:</label>
              <Input type="number" name="min" id={"min"} required />
            </div>
            <div>
              <label htmlFor={"max"}>Valor máximo:</label>
              <Input type="number" name="max" id={"max"} required />
            </div>
          </>
        )}

        {selectedType == "option" && (
          <>
            <div>
              <label htmlFor={"tipoSelecao"}>Tipo de seleção:</label>
              <Select
                name="visualPreference"
                onChange={(e) => {
                  setCurrentVariant(parseInt(e.target.value));
                }}
                id={"tipoSelecao"}
              >
                <option value={0}>Caixa de Seleção</option>
                <option value={1}>Botões Radias</option>
                <option value={2}>Caixa de Checagem</option>
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
                buttonColor={"amethyst"}
                disabled={(() => {
                  return currentOption == "";
                })()}
                onClick={() => {
                  if (addedOptions != undefined) setAddedOptions([...addedOptions, { name: currentOption }]);
                  else setAddedOptions([{ name: currentOption }]);

                  setCurrentOption("");
                }}
                className={"transition-all"}
              >
                Adicionar
              </Button>
            </div>

            {currentVariant == 2 && (
              <div>
                <label htmlFor={"optionLimit"}>Máximo de seleções:</label>
                <Input type="number" name="optionLimit" id={"optionLimit"} required />
              </div>
            )}
          </>
        )}

        {selectedType && (
          <Button disabled={disabled} buttonColor={"amethyst"} type="submit" className={"w-24 transition-all"}>
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
                  <p className={"-mb-1"}>{value.name}</p>
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
                  <input type="hidden" name="options" value={value.name} />
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
