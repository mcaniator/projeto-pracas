"use client";

import { RefObject } from "react";

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
  errorValues,
  checker,
  label,
  description,
}: {
  objectKey: keyof Type;
  answerValues: RefObject<Type>;
  errorValues: errorValues<Type> | null;
  checker: (key: keyof Type) => void;
  label: string;
  description?: string;
}) => {
  return (
    <Input
      name={objectKey as string}
      label={label}
      description={description}
      defaultValue={answerValues.current[objectKey]}
      onChange={(val) => {
        // @ts-expect-error not sure what TS is complaining about here, but doesn't seem to be an actual issue
        answerValues.current[objectKey] = val === "" ? undefined : val;
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
    />
  );
};

export { FormInput };
