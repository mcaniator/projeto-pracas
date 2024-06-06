"use client";

import { Question, Response } from "@prisma/client";

const ResponseViewerClient = ({
  questions,
  responses,
}: {
  questions: Question[] | null;
  responses: Response[] | null;
}) => {
  if (questions === null) {
    return <div>Ainda não há perguntas neste formulário</div>;
  }
  if (responses === null) {
    return <div>Ainda não há respostas para este formulário</div>;
  }

  //TODO TS acusa que o acumulador pode ser nulo ou indefinido
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
              {responsesByQuestionId[question.id] ?
                responsesByQuestionId[question.id].map((response, index) => (
                  <div key={index}>{response.response}</div>
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
