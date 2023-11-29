"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formSubmit } from "@/lib/serverActions/formSubmit";
import { mapEdit } from "@/lib/serverActions/parkSubmit";
import { useRef } from "react";
import { useFormState } from "react-dom";

const initialState = {
  message: "",
};

const FormForm = () => {
  const [state, formAction] = useFormState<{ message: string }, FormData>(formSubmit, initialState);
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
      <Button buttonColor={"amethyst"} type="submit" className={"w-24"}>
        Enviar
      </Button>
    </form>
  );
};

export { FormForm };
