"use client";

import { Button } from "@/components/button";
import { useFormStatus } from "react-dom";

const CreateAssessmentSubmitButton = () => {
  const { pending } = useFormStatus();

  return (
    <Button
      variant={"constructive"}
      type="submit"
      isDisabled={pending ? true : false}
    >
      {pending ? "Criando..." : "Criar avaliação"}
    </Button>
  );
};

export { CreateAssessmentSubmitButton };
