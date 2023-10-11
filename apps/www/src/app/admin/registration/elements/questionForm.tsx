"use client";

import { questionSubmit } from "@/actions/submission";
import { availableCategories } from "@/app/types";
import SubmitButton from "@/components/submitButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import RadioButton from "@/components/ui/radio-button";
import { ChevronsUpDownIcon } from "lucide-react";
import { useRef, useState } from "react";
// @ts-expect-error
import { experimental_useFormState as useFormState } from "react-dom";

interface optionSetter {
  name: string;
}

const initialState = {
  message: null,
};

const QuestionForm = ({
  availableCategories,
}: {
  availableCategories: availableCategories[];
}) => {
  const [state, formAction] = useFormState(questionSubmit, initialState);
  const [selectedType, setSelectedType] = useState("");
  const [currentOption, setCurrentOption] = useState("");
  const [options, setOptions] = useState<optionSetter[]>();
  const [currentVariant, setCurrentVariant] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const questionSetter = () => {
    if (currentOption == "") return;

    if (options != undefined) {
      setOptions([...options, { name: currentOption }]);
    } else {
      setOptions([{ name: currentOption }]);
      inputRef.current?.removeAttribute("required");
    }

    setCurrentOption("");
  };

  return (
    <form
      ref={formRef}
      action={formAction}
      className={"flex gap-5"}
      onSubmit={() =>
        // for some reason this timeout is needed otherwise the inputs are cleared before they're sent to the server
        setTimeout(() => {
          formRef.current?.reset();
          setSelectedType("");
        }, 1)
      }
    >
      <div className={"flex flex-col gap-2"}>
        <div>
          <label htmlFor={"categorias"}>Escolha a categoria:</label>
          <div className={"flex"}>
            <select
              name="select"
              required
              className={
                "h-10 w-full appearance-none rounded-lg pl-3 bg-gray-400/30 pt-1"
              }
              id={"categorias"}
            >
              {availableCategories.map((value, index) => (
                <option key={index} value={value.id}>
                  {value.label}
                </option>
              ))}
            </select>
            <div className={"relative flex items-center -ml-7"}>
              <ChevronsUpDownIcon className={"absolute"} />
            </div>
          </div>
        </div>

        <div>
          <label htmlFor={"question"}>Pergunta:</label>
          <Input type="text" name="name" id={"question"} required />
        </div>

        <div>
          <RadioButton
            type="radio"
            id="text"
            value="text"
            name="inputType"
            onClick={() => {
              setSelectedType("text");
            }}
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
            }}
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
            required
          >
            Opção
          </RadioButton>
        </div>
      </div>

      <div className={"flex flex-col gap-2"}>
        {selectedType == "text" && (
          <div>
            <label htmlFor={"charLimit"}>
              Qual o limite de caracteres da resposta?
            </label>
            <Input type="number" name="charLimit" id={"charLimit"} required />
          </div>
        )}

        {selectedType == "numeric" && (
          <>
            <div>
              <label htmlFor={"min"}>Qual o valor mínimo?</label>
              <Input type="number" name="min" id={"min"} required />
            </div>
            <div>
              <label htmlFor={"max"}>Qual o valor máximo?</label>
              <Input type="number" name="max" id={"max"} required />
            </div>
          </>
        )}

        {selectedType == "option" && (
          <>
            <div>
              <label htmlFor={"tipoSelecao"}>Escolha o tipo de seleção:</label>
              <div className={"flex"}>
                <select
                  name="visualPreference"
                  required
                  onChange={(e) => {
                    setCurrentVariant(parseInt(e.target.value));
                  }}
                  className={
                    "h-10 w-full appearance-none rounded-lg pl-3 bg-gray-400/30 pt-1"
                  }
                  id={"tipoSelecao"}
                >
                  <option value={0}>Caixa de Seleção</option>
                  <option value={1}>Botões Radias</option>
                  <option value={2}>Caixa de Checagem</option>
                </select>
                <div className={"relative flex items-center -ml-7"}>
                  <ChevronsUpDownIcon className={"absolute -"} />
                </div>
              </div>
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
                  ref={inputRef}
                  required
                />
              </div>
              <Button type="button" onClick={questionSetter}>
                Adicionar
              </Button>
              {options && <p>Opções atuais:</p>}
              <div>
                {options?.map((value, index) => (
                  <div key={index}>
                    <p>{value.name}</p>
                    <input type="hidden" name="options" value={value.name} />
                  </div>
                ))}
              </div>
            </div>

            {currentVariant == 2 && (
              <div>
                <label htmlFor={"optionLimit"}>
                  Qual o máximo de opções que podem ser selecionadas?
                </label>
                <Input
                  type="number"
                  name="optionLimit"
                  id={"optionLimit"}
                  required
                />
              </div>
            )}
          </>
        )}

        {selectedType && <SubmitButton />}
        <p>{state?.message}</p>
      </div>
    </form>
  );
};

export { QuestionForm };
