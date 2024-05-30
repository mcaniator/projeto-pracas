"use client";

import { Button } from "@/components/button";
import { useFormStatus } from "react-dom";

const CreateTallySubmitButton = () => {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" isDisabled={pending ? true : false}>
      {pending ? "Criando..." : "Cria contagem"}
    </Button>
  );
};

export { CreateTallySubmitButton };
