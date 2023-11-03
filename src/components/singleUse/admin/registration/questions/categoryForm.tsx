"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { categorySubmit } from "@/lib/serverActions/categorySubmit";
import { useRef } from "react";
import { useFormState } from "react-dom";

const initialState = {
  message: null,
};

const CategoryForm = () => {
  const [state, formAction] = useFormState(categorySubmit, initialState);
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
        <label htmlFor={"name"}>Nome da categoria:</label>
        <Input type="text" name="name" required id={"name"} />
      </div>
      <Button buttonColor={"amethyst"} type="submit" className={"w-24"}>
        Enviar
      </Button>
    </form>
  );
};

export { CategoryForm };
