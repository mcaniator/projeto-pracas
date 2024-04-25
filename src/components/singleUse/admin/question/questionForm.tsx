"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
// import { addQuestion } from "@/serverActions/formUtil";
import { searchQuestionsByStatement } from "@/serverActions/questionUtil";
import { Form } from "@prisma/client";
import { Suspense, use, useDeferredValue, useEffect, useState } from "react";

const QuestionForm = ({
  formId,
  handleQuestionsToAdd,
  questionsToAddIds,
}: {
  formId?: number;
  handleQuestionsToAdd: (id: number) => void;
  questionsToAddIds: number[];
}) => {
  const [targetQuestion, setTargetQuestion] = useState("");

  const [foundQuestions, setFoundQuestions] = useState<Promise<Form[]>>();
  useEffect(() => {
    setFoundQuestions(searchQuestionsByStatement(targetQuestion));
  }, [targetQuestion]);

  const deferredFoundQuestions = useDeferredValue(foundQuestions);

  // TODO: add error handling
  return (
    <div className={"flex min-h-0 flex-grow gap-5 p-5"}>
      <div className="flex basis-full flex-col gap-5 text-white">
        <div
          className={
            "flex basis-1/5 flex-col gap-1 rounded-3xl bg-gray-300/30 p-3 shadow-md"
          }
        >
          <h3 className={"text-2xl font-semibold"}>Busca de Perguntas</h3>
          <div className={"flex flex-col gap-2"}>
            <label htmlFor={"name"}>Buscar pelo enunciado:</label>
            <Input
              type="text"
              name="name"
              required
              id={"name"}
              autoComplete={"none"}
              value={targetQuestion}
              onChange={(e) => setTargetQuestion(e.target.value)}
            />
          </div>
          <Suspense>
            <QuestionList
              questionPromise={deferredFoundQuestions}
              formId={formId}
              handleQuestionsToAdd={handleQuestionsToAdd}
              questionsToAddIds={questionsToAddIds}
            />
          </Suspense>
        </div>
      </div>
    </div>
  );
};

const QuestionList = ({
  questionPromise,
  formId,
  handleQuestionsToAdd,
  questionsToAddIds,
}: {
  questionPromise?: Promise<Form[]>;
  formId?: number;
  handleQuestionsToAdd: (id: number) => void;
  questionsToAddIds: number[];
}) => {
  useEffect(() => {}, [questionsToAddIds.length]);
  if (questionPromise === undefined) return null;
  const questions = use(questionPromise);

  return questions === undefined || questions.length === 0 ?
      null
    : <div className="w-full text-black">
        <div className="text-xl">
          id das perguntas a serem adicionadas é :{questionsToAddIds}
        </div>
        {questions.length > 0 &&
          questions.map((question) =>
            !questionsToAddIds.includes(question.id) ?
              <QuestionComponent
                key={question.id}
                questionId={question.id}
                name={question.name}
                formId={formId}
                handleQuestionsToAdd={handleQuestionsToAdd}
              />
            : null,
          )}
      </div>;
};

const QuestionComponent = ({
  questionId,
  handleQuestionsToAdd,
  name,
  formId,
}: {
  questionId: number;
  handleQuestionsToAdd: (id: number) => void;
  name: string;
  formId?: number;
}) => {
  return (
    <div
      key={questionId}
      className="mb-2 flex items-center justify-between rounded bg-white p-2"
    >
      <Button
        variant={"admin"}
        type="submit"
        className={"w-min"}
        onClick={() => handleQuestionsToAdd(questionId)}
      >
        <span className={"-mb-1"}>Adicionar</span>
      </Button>
      {name}
      <div>o id do formulário é: {formId}</div>
      <div>o id da pergunta é:{questionId}</div>
    </div>
  );
};

export { QuestionForm, QuestionList };
