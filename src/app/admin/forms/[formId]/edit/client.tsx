"use client";

import { Button } from "@/components/button";
import { QuestionForm } from "@/components/singleUse/admin/question/questionForm";
import { CategoriesWithQuestions } from "@/serverActions/categorySubmit";
import { FormToEditPage, createVersion } from "@/serverActions/formUtil";
import { useState } from "react";

import { FormUpdater } from "./formUpdater";

interface DisplayQuestion {
  id: number;
  name: string;
  category: {
    id: number;
    name: string;
  };
  subcategory: {
    id: number;
    name: string;
    categoryId: number;
  } | null;
}

interface DisplayCalculation {
  name: string;
  questions: {
    id: number;
    name: string;
  }[];
  category: {
    id: number;
    name: string;
  };
  subcategory: {
    id: number;
    name: string;
  } | null;
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
  const [questionsToRemove, setQuestionsToRemove] = useState<DisplayQuestion[]>(
    [],
  );
  const [calculationsToAdd, setCalculationsToAdd] = useState<
    DisplayCalculation[]
  >([]);

  const handleQuestionsToAdd = (question: DisplayQuestion) => {
    const questionExists = questionsToAdd.some((q) => q.id === question.id);
    if (!questionExists) {
      setQuestionsToAdd([...questionsToAdd, question]);
      if (questionsToRemove.some((q) => q.id === question.id)) {
        setUpdatedQuestions(
          updatedQuestions.filter((q) => q.id !== question.id),
        );
      } else {
        setUpdatedQuestions([...updatedQuestions, question]);
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

  const handleQuestionsToRemove = (questionId: number) => {
    const questionToRemove = form.questions.find((q) => q.id === questionId);
    if (questionToRemove) {
      setQuestionsToRemove([...questionsToRemove, questionToRemove]);
      setUpdatedQuestions([...updatedQuestions, questionToRemove]);
    }
  };

  const handleCalculationsToAdd = (
    calculation: DisplayCalculation,
    add: boolean,
  ) => {
    if (add) {
      setCalculationsToAdd((prev) => [...prev, calculation]);
    }
  };

  const createNewVersion = (
    formId: number,
    oldQuestions: DisplayQuestion[],
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
    oldQuestions: DisplayQuestion[],
    questionsToAdd: DisplayQuestion[],
    questionsToRemove: DisplayQuestion[],
  ) => {
    let convertedQuestions: DisplayQuestion[];
    let allQuestions: DisplayQuestion[];
    let filteredQuestions: DisplayQuestion[];

    if (oldQuestions !== null) {
      convertedQuestions = oldQuestions.map((question) => question);
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
    : <div className="grid h-full grid-cols-5 overflow-auto">
        <div className="col-span-3 overflow-auto">
          <FormUpdater
            form={form}
            questionsToAdd={questionsToAdd}
            calculationsToAdd={calculationsToAdd}
            cancelAddQuestion={cancelAddQuestion}
            questionsToRemove={questionsToRemove}
            handleQuestionsToRemove={handleQuestionsToRemove}
            handleCalculationsToAdd={handleCalculationsToAdd}
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
export type { DisplayQuestion, DisplayCalculation };
