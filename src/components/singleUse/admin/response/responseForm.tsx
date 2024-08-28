"use client";

import { CategoryWithSubcategoryAndQuestion } from "@/app/admin/parks/[locationId]/evaluation/[selectedFormId]/[selectedAssessmentId]/responseComponent";
import { Button } from "@/components/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { addResponses } from "@/serverActions/responseUtil";
import { Question, QuestionTypes } from "@prisma/client";
import Link from "next/link";
import React from "react";
import { useEffect, useState } from "react";

const ResponseForm = ({
  assessmentId,
  questions,
  options,
  userId,
  categoriesObj,
}: {
  assessmentId: number;
  questions: Question[] | null;
  options: { questionId: number; options: { id: number; text: string }[] }[];
  userId: string;
  categoriesObj: CategoryWithSubcategoryAndQuestion[];
}) => {
  //console.log(options);
  const [responses, setResponses] = useState<{
    [key: number]: { value: string[]; type: QuestionTypes };
  }>(
    questions?.reduce(
      (acc, question) => {
        const valueArray: string[] = [];
        if (question.type === "OPTIONS") {
          valueArray.push("null");
        }
        acc[question.id] = { value: valueArray, type: question.type };
        return acc;
      },
      {} as { [key: number]: { value: string[]; type: QuestionTypes } },
    ) || {},
  );
  const [responsesSent, setResponsesSent] = useState(false);

  const handleCheckboxResponseChange = (
    checked: boolean,
    questionId: number,
    questionType: QuestionTypes,
    value: string,
    maximumSelections: number | null,
  ) => {
    if (checked) {
      setResponses((prevResponses) => {
        const prevResponse = prevResponses[questionId];
        let valueArray: string[] = [];
        if (prevResponse) {
          if (maximumSelections !== null) {
            if (prevResponse.value.length < maximumSelections) {
              valueArray.push(
                ...prevResponse.value.filter((value) => value !== "null"),
              );
              valueArray.push(value);
            } else {
              valueArray = prevResponse.value;
            }
          } else {
            valueArray = prevResponse.value;
          }
        } else {
          valueArray.push(value);
        }

        return {
          ...prevResponses,
          [questionId]: { value: valueArray, type: questionType },
        };
      });
    } else {
      setResponses((prevResponses) => {
        const prevResponse = prevResponses[questionId];
        let valueArray: string[] = [];
        if (prevResponse) {
          valueArray = prevResponse.value.filter(
            (prevValue) => prevValue !== value,
          );
        }
        if (valueArray.length === 0) {
          valueArray.push("null");
        }
        return {
          ...prevResponses,
          [questionId]: { value: valueArray, type: questionType },
        };
      });
    }
  };
  const handleResponseChange = (
    questionId: number,
    questionType: QuestionTypes,
    value: string,
  ) => {
    setResponses((prevResponses) => {
      const valueArray: string[] = [value];
      return {
        ...prevResponses,
        [questionId]: { value: valueArray, type: questionType },
      };
    });
  };

  const handleSubmitResponse = () => {
    const responsesArray = Object.entries(responses).map(
      ([questionId, { value, type }]) => ({
        questionId: Number(questionId),
        type,
        response: value,
      }),
    );
    void addResponses(assessmentId, responsesArray, userId);
    setResponsesSent(!responsesSent);
  };

  useEffect(() => {}, [responses, responsesSent]);

  return (
    <div
      className={
        "flex h-full basis-3/5 flex-col gap-1 overflow-auto rounded-3xl bg-gray-300/30 p-3 shadow-md"
      }
    >
      {questions !== null && responsesSent === false ?
        <>
          {categoriesObj.map((category) => {
            return (
              <React.Fragment key={category.id}>
                <h3 className="text-xl font-bold">{category.name}</h3>
                {category.subcategories.map((subcategory) => {
                  return (
                    <React.Fragment key={subcategory.id}>
                      <h4 className="text-lg font-bold">{subcategory.name}</h4>
                      <ul className="list-disc p-3">
                        {subcategory.questions.map((question) => {
                          const questionOptions =
                            options.find(
                              (opt) => opt.questionId === question.id,
                            )?.options || [];
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
                                          checked={responses[
                                            question.id
                                          ]?.value.includes(String(option.id))}
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
                                        Máximo de seleções:{" "}
                                        {question.maximumSelections}
                                      </h5>
                                      {questionOptions.map((option) => (
                                        <div key={option.id}>
                                          <Checkbox
                                            id={`option${option.id}`}
                                            name={`response${question.id}`}
                                            value={option.id}
                                            checked={responses[
                                              question.id
                                            ]?.value.includes(
                                              String(option.id),
                                            )}
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
                                  value={responses[question.id]?.value || ""}
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
                    </React.Fragment>
                  );
                })}
                <ul className="list-disc p-3">
                  {category.questions.map((question) => {
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
                                    checked={responses[
                                      question.id
                                    ]?.value.includes(String(option.id))}
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
                                  Máximo de seleções:{" "}
                                  {question.maximumSelections}
                                </h5>
                                {questionOptions.map((option) => (
                                  <div key={option.id}>
                                    <Checkbox
                                      id={`option${option.id}`}
                                      name={`response${question.id}`}
                                      value={option.id}
                                      checked={responses[
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
                            value={responses[question.id]?.value || ""}
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
              </React.Fragment>
            );
          })}
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
          Respostas enviadas com sucesso!
          <div>
            <Link href={"/admin/parks/"}>
              <Button className="text-white" variant={"default"}>
                <span className="-mb-1">Voltar à seleção</span>
              </Button>
            </Link>
          </div>
        </div>
      : <div className="text-redwood">Ainda não há perguntas no formulário</div>
      }
    </div>
  );
};

export { ResponseForm };
