"use client";

import { Button } from "@/components/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  ResponseToUpdate,
  updateResponses,
} from "@/serverActions/responseUtil";
import { Question, QuestionTypes } from "@prisma/client";
import { Response } from "@prisma/client";
import Link from "next/link";
import React from "react";
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
  initialResponses?: {
    [key: number]: {
      value: string[];
      type: QuestionTypes;
      responseId: number[];
    };
  };
  onSave?: () => void;
  responses: Response[];
}) => {
  const [responsesState, setResponsesState] = useState<{
    [key: number]: {
      value: string[];
      type: QuestionTypes;
      responseId: number[];
    };
  }>(
    initialResponses ?
      Object.fromEntries(
        Object.entries(initialResponses).map(([key, response]) => [
          Number(key),
          {
            value: response.value,
            type: response.type,
            responseId: response.responseId,
          },
        ]),
      )
    : {},
  );
  const [responsesSent, setResponsesSent] = useState(false);
  //console.log(responsesState);
  const handleResponseChange = (
    questionId: number,
    questionType: QuestionTypes,
    value: string,
  ) => {
    setResponsesState((prevResponses) => {
      const valueArray: string[] = [value];
      const prevResponse = prevResponses[questionId];
      if (prevResponse) {
        return {
          ...prevResponses,
          [questionId]: { ...prevResponse, value: valueArray },
        };
      } else {
        return prevResponses;
      }
    });
  };
  const handleCheckboxResponseChange = (
    checked: boolean,
    questionId: number,
    questionType: QuestionTypes,
    value: string,
    maximumSelections: number | null,
  ) => {
    if (checked) {
      setResponsesState((prevResponses) => {
        const prevResponse = prevResponses[questionId];
        let valueArray: string[] = [];
        if (prevResponse) {
          if (maximumSelections !== null) {
            if (prevResponse.value.length < maximumSelections) {
              valueArray.push(...prevResponse.value);
              valueArray.push(value);
            } else {
              valueArray = prevResponse.value;
            }
          } else {
            valueArray = prevResponse.value;
          }
          return {
            ...prevResponses,
            [questionId]: { ...prevResponse, value: valueArray },
          };
        } else {
          return prevResponses;
        }
      });
    } else {
      setResponsesState((prevResponses) => {
        const prevResponse = prevResponses[questionId];
        let valueArray: string[] = [];
        if (prevResponse) {
          valueArray = prevResponse.value.filter(
            (prevValue) => prevValue !== value,
          );
          return {
            ...prevResponses,
            [questionId]: { ...prevResponse, value: valueArray },
          };
        } else {
          return prevResponses;
        }
      });
    }
  };
  console.log(responsesState);
  const handleSubmitResponse = () => {
    const responsesToUpdate: ResponseToUpdate[] = [];
    for (const key in responsesState) {
      const currentResponse = responsesState[key];
      if (currentResponse) {
        const updatedResponse = {
          ...currentResponse,
          locationId,
          formId,
          questionId: Number(key),
        };
        if (initialResponses) {
          const initialResponse = initialResponses[key];
          if (updatedResponse && initialResponse) {
            if (updatedResponse.value !== initialResponses[key]?.value) {
              responsesToUpdate.push(updatedResponse);
            }
          }
        }
      }
    }

    void updateResponses(responsesToUpdate);

    responses.forEach((response) => {
      //console.log(response);
      const { questionId } = response;
      const updatedResponse = responsesState[questionId];
      if (
        updatedResponse &&
        true /*updatedResponse.value !== response.response*/
      ) {
        /*void updateResponse(
          response.id,
          locationId,
          formId,
          questionId,
          updatedResponse.type,
          updatedResponse.value,
        );*/
        //console.log(updatedResponse);
      }
    });
    setResponsesSent(true);
    if (onSave) {
      onSave();
    }
  };
  //console.log(responsesState);
  useEffect(() => {
    if (initialResponses) {
      setResponsesState(
        Object.fromEntries(
          Object.entries(initialResponses).map(([key, response]) => [
            Number(key),
            {
              value: response.value,
              type: response.type,
              responseId: response.responseId,
            },
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
                      {question.optionType === "RADIO" &&
                        questionOptions.map((option) => (
                          <div key={option.id}>
                            <input
                              type="radio"
                              id={`option${option.id}`}
                              name={`response${question.id}`}
                              value={option.id}
                              checked={responsesState[
                                question.id
                              ]?.value.includes(option.id.toString())}
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
                      {question.optionType === "CHECKBOX" && (
                        <React.Fragment>
                          <h5>
                            Máximo de seleções: {question.maximumSelections}
                          </h5>
                          {questionOptions.map((option) => (
                            <div key={option.id}>
                              <Checkbox
                                id={`option${option.id}`}
                                name={`response${question.id}`}
                                value={option.id}
                                checked={responsesState[
                                  question.id
                                ]?.value.includes(String(option.id))}
                                onChange={(e) =>
                                  handleCheckboxResponseChange(
                                    e.target.checked,
                                    question.id,
                                    question.type,
                                    e.target.value,
                                    question.maximumSelections,
                                  )
                                }
                              >
                                {option.text}
                              </Checkbox>
                            </div>
                          ))}
                        </React.Fragment>
                      )}
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
