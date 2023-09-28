"use client";

import { categorySubmit } from "@/actions/submition";
import SubmitButton from "@/components/submitButton";
import { Input } from "@/components/ui/input";
import { useRef } from "react";
// @ts-expect-error
import { experimental_useFormState as useFormState } from "react-dom";

const initialState = {
  message: null,
};

export function ProfileForm() {
  const [state, formAction] = useFormState(categorySubmit, initialState);
  const formRef = useRef<HTMLFormElement>(null);

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
      <SubmitButton />
      <p>{state?.message}</p>
    </form>
  );
}
