"use client";

import { Button } from "@/components/button";
import { useFormStatus } from "react-dom";

const CreateTallySubmitButton = () => {
  const { pending } = useFormStatus();

  return (
    <Button
      variant={"constructive"}
      type="submit"
      isDisabled={pending ? true : false}
    >
      {pending ? "Criando..." : "Criar contagem"}
    </Button>
  );
};

export { CreateTallySubmitButton };
