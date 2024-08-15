"use client";

import { Question, Response } from "@prisma/client";
import { QuestionTypes } from "@prisma/client";
import { useState } from "react";

import { ResponseEditor } from "./responseEditor";

const ResponseViewerClient = ({
  questions,
  options,
  responses,
  envios,
  locationId,
  formId,
}: {
  questions: Question[] | null;
  options: {
    questionId: number;
    options: { id: number; text: string; frequency: number }[];
  }[];
  responses: Response[] | null;
  envios: { envioId: string; responses: Response[] }[];
  locationId: number;
  formId: number;
}) => {
  //console.log(envios);
  const [editingEnvioId, setEditingEnvioId] = useState<string | null>(null);
  if (questions === null) {
    return <div>Ainda não há perguntas neste formulário</div>;
  }
  if (responses === null) {
    return <div>Ainda não há respostas para este formulário</div>;
  }

  const handleEditEnvio = (envioId: string | null) => {
    if (envioId === null) return;
    setEditingEnvioId(envioId);
  };

  const getInitialResponses = (responses: Response[]) => {
    const questionChar = questions.reduce(
      (acc, question) => {
        if (!acc[question.id]) {
          acc[question.id] = {
            value: [],
            type: question.type,
            responseId: [],
          };
        }
        return acc;
      },
      {} as {
        [key: number]: {
          value: string[];
          type: QuestionTypes;
          responseId: number[];
        };
      },
    );
    const char = responses.reduce(
      (acc, response) => {
        if (!acc[response.questionId]) {
          acc[response.questionId] = {
            value: [],
            type: response.type,
            responseId: [],
          };
        }
        acc[response.questionId]?.responseId.push(response.id);
        if (response.response) {
          acc[response.questionId]?.value.push(response.response);
        }

        return acc;
      },
      {} as {
        [key: number]: {
          value: string[];
          type: QuestionTypes;
          responseId: number[];
        };
      },
    );
    Object.keys(char).forEach((key) => {
      const questionId = Number(key);
      if (questionChar[questionId] && char[questionId]) {
        questionChar[questionId].value = questionChar[questionId].value.concat(
          char[questionId].value,
        );

        questionChar[questionId].responseId = questionChar[
          questionId
        ].responseId.concat(char[questionId].responseId);
      }
    });
    return questionChar;
  };
  const responsesByQuestionId = responses.reduce(
    (acc, response) => {
      if (!acc[response.questionId]) {
        acc[response.questionId] = [];
      }
      acc[response.questionId]?.push(response);
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

  const sortedEnvios = [...envios].sort(
    (a, b) => new Date(b.envioId).getTime() - new Date(a.envioId).getTime(),
  );

  const recentEnvios = sortedEnvios.slice(0, 3);

  return (
    <div className="flex gap-5">
      <div
        className={
          "flex basis-3/5 flex-col gap-1 rounded-3xl bg-gray-300/30 p-3 shadow-md"
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
                    {optionsByQuestionId[question.id]?.map((option) => (
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
                  responsesByQuestionId[question.id]?.map((response, index) => (
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

      <div className="flex basis-2/5 flex-col gap-3">
        <h3 className="text-lg font-bold">3 Envios Mais Recentes</h3>
        {recentEnvios.map((envio, index) => {
          const envioDate = new Date(envio.envioId);
          const formattedDate = envioDate.toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            year: "2-digit",
          });
          const formattedTime = envioDate.toLocaleTimeString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit",
          });
          const isEditing = editingEnvioId === envio.envioId;

          return (
            <div
              key={index}
              className="rounded-lg bg-transparent p-3 shadow-md"
            >
              <h4 className="font-semibold">
                Envio em: {formattedDate} às {formattedTime}
              </h4>
              {isEditing ?
                <ResponseEditor
                  locationId={locationId}
                  formId={formId}
                  questions={questions}
                  options={options}
                  initialResponses={getInitialResponses(envio.responses)}
                  onSave={() => handleEditEnvio(null)}
                  responses={envio.responses}
                />
              : <button
                  onClick={() => handleEditEnvio(envio.envioId)}
                  className="mt-2 rounded bg-blue-500 px-4 py-2 text-white hover:bg-green-700"
                >
                  Editar
                </button>
              }
            </div>
          );
        })}
      </div>
    </div>
  );
};

export { ResponseViewerClient };
