"use client";

import { availableCategories } from "@/app/types";
import { Fragment, useRef, useState } from "react";
import SubmitButton from "./submitButton";
import { questionSubmit } from "./submition";
import { Button } from "./ui/button";

interface optionSetter {
  name: string;
}

const QuestionForm = ({
  availableCategories,
}: {
  availableCategories: availableCategories[];
}) => {
  const [selectedType, setSelectedType] = useState("");
  const [currentOption, setCurrentOption] = useState("");
  const [options, setOptions] = useState<optionSetter[]>();
  const [currentVariant, setCurrentVariant] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

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
    <form action={questionSubmit}>
      <select name="select" required>
        {availableCategories.map((value, index) => (
          <option key={index} value={value.id}>
            {value.label}
          </option>
        ))}
      </select>

      <input type="text" name="name" required />

      <>
        <label>
          <input
            type="radio"
            id="text"
            value="text"
            name="inputType"
            onClick={() => {
              setSelectedType("text");
            }}
            required
          />
          Texto
        </label>
        <label>
          <input
            type="radio"
            id="numeric"
            value="numeric"
            name="inputType"
            onClick={() => {
              setSelectedType("numeric");
            }}
            required
          />
          Númerico
        </label>
        <label>
          <input
            type="radio"
            id="option"
            value="option"
            name="inputType"
            onClick={() => {
              setSelectedType("option");
            }}
            required
          />
          Opção
        </label>
      </>

      {selectedType == "text" && (
        <input type="number" name="charLimit" required />
      )}

      {selectedType == "numeric" && (
        <>
          <input type="number" name="min" required />
          <input type="number" name="max" required />
        </>
      )}

      {selectedType == "option" && (
        <>
          <select
            name="visualPreference"
            required
            onChange={(e) => {
              setCurrentVariant(parseInt(e.target.value));
            }}
          >
            <option value={0}>Caixa de Seleção</option>
            <option value={1}>Botoões Radias</option>
            <option value={2}>Caixa de Checagem</option>
          </select>

          <div>
            <input
              type="text"
              value={currentOption}
              onChange={(e) => {
                setCurrentOption(e.target.value);
              }}
              ref={inputRef}
              required
            />
            <Button type="button" onClick={questionSetter} />
            {options?.map((value, index) => (
              <Fragment key={index}>
                <p>{value.name}</p>
                <input type="hidden" name="options" value={value.name} />
              </Fragment>
            ))}
          </div>

          {currentVariant == 2 && (
            <input type="number" name="optionLimit" required />
          )}
        </>
      )}

      <SubmitButton />
    </form>
  );
};

export { QuestionForm };
