"use client";

import { QuestionForm } from "@/components/singleUse/admin/question/questionForm";
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
    : <div className="flex">
        <div className="w-1/2">
          <FormUpdater
            form={form}
            questions={questions}
            questionsToAdd={questionsToAdd}
          />
        </div>
        <div className="w-1/2">
          <QuestionForm
            formId={form.id}
            handleQuestionsToAdd={handleQuestionsToAdd}
            questionsToAdd={questionsToAdd}
          />
        </div>
      </div>;
};
export default Client;
export type { DisplayQuestion };
