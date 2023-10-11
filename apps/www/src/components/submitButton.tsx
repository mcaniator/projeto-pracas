"use client";

import { ButtonHTMLAttributes } from "react";
// @ts-expect-error
import { experimental_useFormStatus as useFormStatus } from "react-dom";

import { Button } from "./ui/button";

const SubmitButton = ({
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) => {
  const { pending } = useFormStatus();

  return (
    <Button aria-disabled={pending} type="submit" className={"w-24"} {...props}>
      {pending ? "Enviando..." : "Enviar"}
    </Button>
  );
};

export default SubmitButton;
