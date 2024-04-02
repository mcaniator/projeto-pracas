"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
// import { addQuestion } from "@/serverActions/formUtil";
import { searchQuestionsByStatement } from "@/serverActions/questionUtil";
import { Form } from "@prisma/client";
import { Suspense, use, useDeferredValue, useEffect, useState } from "react";

const handleAddQuestion = (
  questionId: number,
  addToQuestionsToAddId: (id: number) => void,
) => {
  addToQuestionsToAddId(questionId);
};

const QuestionComponent = ({
  questionId,
  addToQuestionsToAddId,
  name,
  formId,
}: {
  questionId: number;
  addToQuestionsToAddId: (id: number) => void;
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
        onClick={() => handleAddQuestion(questionId, addToQuestionsToAddId)}
      >
        <span className={"-mb-1"}>Adicionar</span>
      </Button>
      {name}
      <div>o id do formulário é: {formId}</div>
      <div>o id da pergunta é:{questionId}</div>
    </div>
  );
};

const QuestionList = ({
  questionPromise,
  formId,
}: {
  questionPromise?: Promise<Form[]>;
  formId?: number;
}) => {
  const [questionsToAddId, setQuestionsToAddId] = useState<number[]>([]);
  useEffect(() => {}, [questionsToAddId.length]);
  if (questionPromise === undefined) return null;
  const questions = use(questionPromise);

  const addToQuestionsToAddId = (questionId: number) => {
    if (!questionsToAddId.includes(questionId)) {
      setQuestionsToAddId([...questionsToAddId, questionId]);
    }
  };
  return questions === undefined || questions.length === 0 ?
      null
    : <div className="w-full text-black">
        <div className="text-xl">
          id das perguntas a serem adicionadas é :{questionsToAddId}
        </div>
        {questions.length > 0 &&
          questions.map((question) => (
            <QuestionComponent
              key={question.id}
              questionId={question.id}
              name={question.name}
              formId={formId}
              addToQuestionsToAddId={addToQuestionsToAddId}
            />
          ))}
      </div>;
};

const QuestionForm = ({ formId }: { formId?: number }) => {
  const [targetQuestion, setTargetQuestion] = useState("");

  const [foundQuestions, setFoundQuestions] = useState<Promise<Form[]>>();
  useEffect(() => {
    setFoundQuestions(searchQuestionsByStatement(targetQuestion));
  }, [targetQuestion]);

  const deferredFoundQuestions = useDeferredValue(foundQuestions);

  // TODO: add error handling
  return (
    <>
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
        />
      </Suspense>
    </>
  );
};

export { QuestionForm, QuestionList };
