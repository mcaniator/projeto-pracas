"use client";

import { Dispatch, SetStateAction } from "react";
import { TextFieldProps } from "react-aria-components";

import { Input } from "./input";

type errorValues<Type> = {
  [Propery in keyof Type]?: string[] | undefined;
};

const FormInput = <
  Type extends
    | { [key: string]: string }
    | { [key: string]: string | undefined },
>({
  objectKey,
  answerValues,
  setAnswerValues,
  errorValues,
  checker,
  label,
  description,
  ...props
}: {
  objectKey: keyof Type;
  answerValues: Type;
  setAnswerValues: Dispatch<SetStateAction<Type>>;
  errorValues: errorValues<Type> | null;
  checker: (key: keyof Type) => void;
  label: string;
  description?: string;
} & Omit<TextFieldProps, "className">) => {
  return (
    <Input
      name={objectKey as string}
      label={label}
      description={description}
      defaultValue={answerValues[objectKey]}
      onChange={(val) => {
        setAnswerValues((answerValues) => {
          const auxAnswerValues = answerValues;
          // @ts-expect-error not sure what TS is complaining about here, but doesn't seem to be an actual issue
          auxAnswerValues[objectKey] = val === "" ? undefined : val;
          return auxAnswerValues;
        });
        checker(objectKey);
      }}
      errorMessage={() => {
        if (errorValues === null) return "";

        const errors = errorValues[objectKey];
        if (errors === undefined) return "";

        const value = errors[0];
        if (value === undefined) return "";

        return value;
      }}
      isInvalid={
        errorValues === null ? false : errorValues[objectKey] !== undefined
      }
      onBlur={() => checker(objectKey)}
      {...props}
    />
  );
};

export { FormInput };
