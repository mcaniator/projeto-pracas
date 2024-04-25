"use client";

import { QuestionForm } from "@/components/singleUse/admin/question/questionForm";
import { Button } from "@/components/ui/button";
import { Form, Question } from "@prisma/client";
import { useState } from "react";

import { FormUpdater } from "./formUpdater";

interface DisplayQuestion {
  id: number;
  name: string;
}

const Client = ({
  form,
  questions,
}: {
  form?: Form | null;
  questions: Question[] | null;
}) => {
  const [questionsToAdd, setQuestionsToAdd] = useState<DisplayQuestion[]>([]);

  const handleQuestionsToAdd = (questionId: number, questionName: string) => {
    const questionExists = questionsToAdd.some((q) => q.id === questionId);
    const newQuestion: DisplayQuestion = { id: questionId, name: questionName };
    if (!questionExists) {
      setQuestionsToAdd([...questionsToAdd, newQuestion]);
    }
  };

  return form == null ?
      <div>Formulário não encontrado</div>
    : <div className="grid grid-cols-5 gap-4">
        <div className="col-span-3">
          <FormUpdater
            form={form}
            questions={questions}
            questionsToAdd={questionsToAdd}
          />
        </div>
        <div className="col-span-2">
          <QuestionForm
            formId={form.id}
            handleQuestionsToAdd={handleQuestionsToAdd}
            questionsToAdd={questionsToAdd}
          />
        </div>
        <div className="col-span-4 flex justify-center">
          {questionsToAdd.length > 0 && (
            <Button variant={"admin"}>Criar nova versão</Button>
          )}
        </div>
      </div>;
};
export default Client;
export type { DisplayQuestion };
