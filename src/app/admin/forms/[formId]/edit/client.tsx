"use client";

import { Button } from "@/components/button";
import { QuestionForm } from "@/components/singleUse/admin/question/questionForm";
import { CategoriesWithQuestions } from "@/serverActions/categorySubmit";
import { FormToEditPage, createVersion } from "@/serverActions/formUtil";
import { Question } from "@prisma/client";
import { useState } from "react";

import { FormUpdater } from "./formUpdater";

interface DisplayQuestion {
  id: number;
  name: string;
}

const Client = ({
  form,
  categories,
}: {
  form: FormToEditPage;
  categories: CategoriesWithQuestions;
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

  const [questionsToRemove, setQuestionsToRemove] = useState<DisplayQuestion[]>(
    [],
  );

  const handleQuestionsToRemove = (questionId: number) => {
    const questionToRemove = form.questions.find((q) => q.id === questionId);
    if (questionToRemove) {
      setQuestionsToRemove([...questionsToRemove, questionToRemove]);
      setUpdatedQuestions([...updatedQuestions, questionToRemove]);
    }
  };

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
    let convertedQuestions: DisplayQuestion[];
    let allQuestions: DisplayQuestion[];
    let filteredQuestions: DisplayQuestion[];

    if (oldQuestions !== null) {
      convertedQuestions = oldQuestions.map((question) => ({
        id: question.id,
        name: question.name,
      }));
      allQuestions = convertedQuestions.concat(questionsToAdd);
      filteredQuestions = allQuestions.filter(
        (question) =>
          !questionsToRemove.some(
            (removeQuestion) => removeQuestion.id === question.id,
          ),
      );
    } else {
      filteredQuestions = questionsToAdd.filter(
        (question) =>
          !questionsToRemove.some(
            (removeQuestion) => removeQuestion.id === question.id,
          ),
      );
    }

    void createVersion(formId, filteredQuestions);
  };

  return form == null ?
      <div>Formulário não encontrado</div>
    : <div className="grid h-full grid-cols-5 gap-4">
        <div className="col-span-3">
          <FormUpdater
            form={form}
            questionsToAdd={questionsToAdd}
            cancelAddQuestion={cancelAddQuestion}
            questionsToRemove={questionsToRemove}
            handleQuestionsToRemove={handleQuestionsToRemove}
          />
        </div>
        <div className="col-span-2 h-full overflow-auto">
          <QuestionForm
            formId={form.id}
            initialQuestions={form.questions}
            handleQuestionsToAdd={handleQuestionsToAdd}
            questionsToAdd={questionsToAdd}
            questionsToRemove={questionsToRemove}
            categories={categories}
          />
        </div>
        <div className="col-span-4 flex justify-center">
          {updatedQuestions.length !== 0 && (
            <Button
              variant={"admin"}
              onPress={() =>
                createNewVersion(
                  form.id,
                  form.questions,
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
