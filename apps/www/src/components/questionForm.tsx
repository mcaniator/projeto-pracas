"use client";

import { availableCategories } from "@/app/types";
import { useState } from "react";
import SubmitButton from "./submitButton";
import { questionSubmit } from "./submition";

const QuestionForm = ({
  availableCategories,
}: {
  availableCategories: availableCategories[];
}) => {
  const [selectedType, setSelectedType] = useState("");

  return (
    <form action={questionSubmit}>
      <label htmlFor="select" />
      <select name="select">
        {availableCategories.map((value, index) => (
          <option key={index} value={value.id}>
            {value.label}
          </option>
        ))}
      </select>

      <input type="text" name="name" />

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
          />
          Opção
        </label>
      </>

      {selectedType == "text" && <input type="number" name="charLimit" />}
      {selectedType == "numeric" && (
        <>
          <input type="number" name="min" />
          <input type="number" name="max" />
        </>
      )}
      {selectedType == "option" && <div>oi</div>}

      <SubmitButton />
    </form>
  );
};

export { QuestionForm };
