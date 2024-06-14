"use client";

import { Question, Response } from "@prisma/client";
import { QuestionTypes } from "@prisma/client";

const ResponseViewerClient = ({
  questions,
  options,
  responses,
}: {
  questions: Question[] | null;
  options: {
    questionId: number;
    options: { id: number; text: string; frequency: number }[];
  }[];
  responses: Response[] | null;
}) => {
  if (questions === null) {
    return <div>Ainda não há perguntas neste formulário</div>;
  }
  if (responses === null) {
    return <div>Ainda não há respostas para este formulário</div>;
  }

  const responsesByQuestionId = responses.reduce(
    (acc, response) => {
      if (!acc[response.questionId]) {
        acc[response.questionId] = [];
      }
      acc[response.questionId].push(response);
      return acc;
    },
    {} as { [key: number]: Response[] },
  );

  const optionsByQuestionId = options.reduce(
    (acc, option) => {
      acc[option.questionId] = option.options;
      return acc;
    },
    {} as { [key: number]: { id: number; text: string; frequency: number }[] },
  );

  return (
    <div
      className={
        "flex basis-1/5 flex-col gap-1 rounded-3xl bg-gray-300/30 p-3 shadow-md"
      }
    >
      <ul className="list-disc p-3">
        {questions.map((question) => (
          <li key={question.id}>
            <div>{question.name}</div>
            <div>
              {(
                question.type === QuestionTypes.OPTIONS &&
                optionsByQuestionId[question.id]
              ) ?
                <div>
                  {optionsByQuestionId[question.id].map((option) => (
                    <div key={option.id}>
                      <span>{option.text}</span>
                      <span className="font-bold text-blue-500">
                        {" "}
                        Frequência: {option.frequency}
                      </span>
                    </div>
                  ))}
                </div>
              : responsesByQuestionId[question.id] ?
                responsesByQuestionId[question.id].map((response, index) => (
                  <div key={index}>
                    {question.type === QuestionTypes.TEXT ?
                      <div>{response.response}</div>
                    : question.type === QuestionTypes.NUMERIC ?
                      <div>
                        <span>{response.response}</span>
                        <span className="font-bold text-blue-500">
                          {" "}
                          Frequência: {response.frequency}
                        </span>
                      </div>
                    : <div>{response.response}</div>}
                  </div>
                ))
              : <div>Não há respostas para esta pergunta</div>}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export { ResponseViewerClient };
