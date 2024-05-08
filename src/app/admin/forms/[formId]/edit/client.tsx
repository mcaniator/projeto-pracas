"use client";

import { QuestionForm } from "@/components/singleUse/admin/question/questionForm";
import { Button } from "@/components/ui/button";
import {
  createVersion, // addQuestions,
  // removeQuestions,
} from "@/serverActions/formUtil";
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
  questions: Question[];
}) => {
  const [updatedQuestions, setUpdatedQuestions] = useState<DisplayQuestion[]>(
    [],
  );

  const [questionsToAdd, setQuestionsToAdd] = useState<DisplayQuestion[]>([]);

  const handleQuestionsToAdd = (questionId: number, questionName: string) => {
    const questionExists = questionsToAdd.some((q) => q.id === questionId);
    const newQuestion: DisplayQuestion = { id: questionId, name: questionName };
    if (!questionExists) {
      setQuestionsToAdd([...questionsToAdd, newQuestion]);
      if (questionsToRemove.some((q) => q.id === questionId)) {
        setUpdatedQuestions(
          updatedQuestions.filter((q) => q.id !== questionId),
        );
      } else {
        setUpdatedQuestions([...updatedQuestions, newQuestion]);
      }
    }
  };

  const cancelAddQuestion = (questionId: number) => {
    setQuestionsToAdd((prevQuestionsToAdd) =>
      prevQuestionsToAdd.filter((q) => q.id !== questionId),
    );
    if (questionsToAdd.some((q) => q.id === questionId)) {
      setUpdatedQuestions(updatedQuestions.filter((q) => q.id !== questionId));
    }
  };

  // const handleAddQuestion = (formId: number, questions: DisplayQuestion[]) => {
  //   void addQuestions(formId, questions);
  //   setQuestionsToAdd([]);
  // };

  const [questionsToRemove, setQuestionsToRemove] = useState<DisplayQuestion[]>(
    [],
  );

  const handleQuestionsToRemove = (questionId: number) => {
    const questionToRemove = questions.find((q) => q.id === questionId);
    if (questionToRemove) {
      setQuestionsToRemove([...questionsToRemove, questionToRemove]);
      setUpdatedQuestions([...updatedQuestions, questionToRemove]);
    }
  };

  // const handleRemoveQuestions = (
  //   formId: number,
  //   questions: DisplayQuestion[],
  // ) => {
  //   void removeQuestions(formId, questions);
  //   setQuestionsToRemove([]);
  // };

  const createNewVersion = (
    formId: number,
    oldQuestions: Question[],
    questionsToAdd: DisplayQuestion[],
    questionsToRemove: DisplayQuestion[],
  ) => {
    handleCreateVersion(
      formId,
      oldQuestions,
      questionsToAdd,
      questionsToRemove,
    );
    // handleAddQuestion(formId, questionsToAdd);
    // handleRemoveQuestions(formId, questionsToRemove);
    setUpdatedQuestions([]);
    setQuestionsToAdd([]);
    setQuestionsToRemove([]);
  };

  const handleCreateVersion = (
    formId: number,
    oldQuestions: Question[],
    questionsToAdd: DisplayQuestion[],
    questionsToRemove: DisplayQuestion[],
  ) => {
    const convertedQuestions: DisplayQuestion[] = oldQuestions.map(
      (question) => ({
        id: question.id,
        name: question.name,
      }),
    );

    const allQuestions: DisplayQuestion[] =
      convertedQuestions.concat(questionsToAdd);

    const filteredQuestions: DisplayQuestion[] = allQuestions.filter(
      (question) =>
        !questionsToRemove.some(
          (removeQuestion) => removeQuestion.id === question.id,
        ),
    );
    void createVersion(formId, filteredQuestions);
  };

  return form == null ?
      <div>Formulário não encontrado</div>
    : <div className="grid grid-cols-5 gap-4">
        <div className="col-span-3">
          <FormUpdater
            form={form}
            questions={questions}
            questionsToAdd={questionsToAdd}
            cancelAddQuestion={cancelAddQuestion}
            questionsToRemove={questionsToRemove}
            handleQuestionsToRemove={handleQuestionsToRemove}
          />
        </div>
        <div className="col-span-2">
          <QuestionForm
            formId={form.id}
            initialQuestions={questions}
            handleQuestionsToAdd={handleQuestionsToAdd}
            questionsToAdd={questionsToAdd}
            questionsToRemove={questionsToRemove}
          />
        </div>
        <div className="col-span-4 flex justify-center">
          {updatedQuestions.length !== 0 && (
            <Button
              variant={"admin"}
              onClick={() =>
                createNewVersion(
                  form.id,
                  questions,
                  questionsToAdd,
                  questionsToRemove,
                )
              }
            >
              Criar nova versão
            </Button>
          )}
        </div>
      </div>;
};
export default Client;
export type { DisplayQuestion };
