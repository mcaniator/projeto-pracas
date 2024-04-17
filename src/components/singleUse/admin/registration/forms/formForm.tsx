"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/old-button";
import { formSubmit } from "@/serverActions/formSubmit";
import { useRef } from "react";
import { useFormState } from "react-dom";

const initialState = {
  message: "",
};

const FormForm = () => {
  const [, formAction] = useFormState(formSubmit, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  // TODO: add error handling
  return (
    <form
      ref={formRef}
      action={formAction}
      className={"flex flex-col gap-2"}
      onSubmit={() =>
        setTimeout(() => {
          formRef.current?.reset();
        }, 1)
      }
    >
      <div>
        <label htmlFor={"name"}>Nome do formulário:</label>
        <Input type="text" name="name" required id={"name"} />
      </div>
      <Button variant={"admin"} type="submit" className={"w-min"}>
        <span className={"-mb-1"}>Enviar</span>
      </Button>
    </form>
  );
};

export { FormForm };
