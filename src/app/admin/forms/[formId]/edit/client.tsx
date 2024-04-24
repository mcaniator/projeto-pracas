"use client";

import { QuestionForm } from "@/components/singleUse/admin/question/questionForm";
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
  const [questionsToAddIds, setQuestionsToAddIds] = useState<number[]>([]);
  const handleQuestionsToAdd = (questionId: number) => {
    if (!questionsToAddIds.includes(questionId)) {
      setQuestionsToAddIds([...questionsToAddIds, questionId]);
    }
  };
  return form == null ?
      <div>Formulário não encontrado</div>
    : <div className="flex">
        <div className="w-1/2">
          <FormUpdater
            form={form}
            questions={questions}
            questionsToAddIds={questionsToAddIds}
          />
        </div>
        <div className="w-1/2">
          <QuestionForm
            formId={form.id}
            handleQuestionsToAdd={handleQuestionsToAdd}
            questionsToAddIds={questionsToAddIds}
          />
        </div>
      </div>;
};
export default Client;
