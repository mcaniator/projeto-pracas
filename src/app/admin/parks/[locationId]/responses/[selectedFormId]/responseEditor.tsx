"use client";

import { Button } from "@/components/button";
import { Input } from "@/components/ui/input";
import { updateResponse } from "@/serverActions/responseUtil";
import { Question, QuestionTypes } from "@prisma/client";
import { Response } from "@prisma/client";
import Link from "next/link";
import { useEffect, useState } from "react";

const ResponseEditor = ({
  locationId,
  formId,
  questions,
  options,
  initialResponses,
  onSave,
  responses,
}: {
  locationId: number;
  formId: number;
  questions: Question[] | null;
  options: { questionId: number; options: { id: number; text: string }[] }[];
  initialResponses?: { [key: number]: string };
  onSave?: () => void;
  responses: Response[];
}) => {
  const [responsesState, setResponsesState] = useState<{
    [key: number]: { value: string; type: QuestionTypes };
  }>(
    initialResponses ?
      Object.fromEntries(
        Object.entries(initialResponses).map(([key, value]) => [
          Number(key),
          { value, type: QuestionTypes.TEXT },
        ]),
      )
    : {},
  );
  const [responsesSent, setResponsesSent] = useState(false);

  const handleResponseChange = (
    questionId: number,
    questionType: QuestionTypes,
    value: string,
  ) => {
    setResponsesState((prevResponses) => ({
      ...prevResponses,
      [questionId]: { value, type: questionType },
    }));
  };

  const handleSubmitResponse = () => {
    responses.forEach((response) => {
      const { questionId } = response;
      const updatedResponse = responsesState[questionId];
      if (updatedResponse && updatedResponse.value !== response.response) {
        void updateResponse(
          response.id,
          locationId,
          formId,
          questionId,
          updatedResponse.type,
          updatedResponse.value,
        );
      }
    });
    setResponsesSent(true);
    if (onSave) {
      onSave();
    }
  };

  useEffect(() => {
    if (initialResponses) {
      setResponsesState(
        Object.fromEntries(
          Object.entries(initialResponses).map(([key, value]) => [
            Number(key),
            { value, type: QuestionTypes.TEXT },
          ]),
        ),
      );
    }
  }, [initialResponses]);

  return (
    <div
      className={
        "flex basis-1/5 flex-col gap-1 rounded-3xl bg-gray-300/30 p-3 shadow-md"
      }
    >
      {questions !== null && responsesSent === false ?
        <>
          <ul className="list-disc p-3">
            {questions.map((question) => {
              const questionOptions =
                options.find((opt) => opt.questionId === question.id)
                  ?.options || [];
              return (
                <li key={question.id}>
                  <label htmlFor={`response${question.id}`}>
                    {question.name}
                  </label>
                  {question.type === QuestionTypes.OPTIONS ?
                    <div>
                      {questionOptions.map((option) => (
                        <div key={option.id}>
                          <input
                            type="radio"
                            id={`option${option.id}`}
                            name={`response${question.id}`}
                            value={option.id}
                            checked={
                              responsesState[question.id]?.value ===
                              option.id.toString()
                            }
                            onChange={(e) =>
                              handleResponseChange(
                                question.id,
                                question.type,
                                e.target.value,
                              )
                            }
                          />
                          <label htmlFor={`option${option.id}`}>
                            {option.text}
                          </label>
                        </div>
                      ))}
                    </div>
                  : <Input
                      type="text"
                      name={`response${question.id}`}
                      id={`response${question.id}`}
                      value={responsesState[question.id]?.value || ""}
                      onChange={(e) =>
                        handleResponseChange(
                          question.id,
                          question.type,
                          e.target.value,
                        )
                      }
                    />
                  }
                </li>
              );
            })}
          </ul>
          <div className="mb-2 flex items-center justify-between rounded p-2">
            <Button
              variant={"admin"}
              type="button"
              className={"w-min"}
              onPress={handleSubmitResponse}
            >
              <span className={"-mb-1"}>Enviar Respostas</span>
            </Button>
          </div>
        </>
      : questions !== null && responsesSent === true ?
        <div className="flex-row text-4xl">
          Respostas alteradas com sucesso!
          <div>
            <Link href={`/admin/parks/${locationId}/responses/${formId}`}>
              <Button className="text-white" variant={"default"}>
                <span className="-mb-1">Recarregar</span>
              </Button>
            </Link>
          </div>
        </div>
      : <div className="text-redwood">Ainda não há perguntas no formulário</div>
      }
    </div>
  );
};

export { ResponseEditor };
