"use client";

import { QuestionForm } from "@/components/singleUse/admin/question/questionForm";
import { Button } from "@/components/ui/button";
import { Form, Question } from "@prisma/client";
import { useState } from "react";

import { FormUpdater } from "./formUpdater";

const Client = ({
  form,
  questions,
}: {
  form?: Form | null;
  questions: Question[] | null;
}) => {
  const [test, setTest] = useState("test");

  return form == null ?
      <div>Formulário não encontrado</div>
    : <div className="flex">
        <div className="w-1/2">
          <FormUpdater form={form} questions={questions} />
        </div>
        <div className="w-1/2">
          <QuestionForm formId={form.id} />
        </div>
        <Button onClick={() => setTest("Funcionou")}>{test}</Button>
      </div>;
};
export default Client;
