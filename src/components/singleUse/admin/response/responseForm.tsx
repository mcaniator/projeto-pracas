"use client";

import {
  AssessmentWithResposes,
  CategoryWithSubcategoryAndQuestion,
} from "@/app/admin/parks/[locationId]/evaluation/[selectedFormId]/[selectedAssessmentId]/responseComponent";
import { Button } from "@/components/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { deleteAssessment } from "@/serverActions/assessmentUtil";
import { addResponses } from "@/serverActions/responseUtil";
import { QuestionTypes } from "@prisma/client";
import Link from "next/link";
import React from "react";
import { useEffect, useState } from "react";

const ResponseForm = ({
  userId,
  categoriesObj,
  assessment,
}: {
  userId: string;
  categoriesObj: CategoryWithSubcategoryAndQuestion[];
  assessment: AssessmentWithResposes;
}) => {
  // console.log(assessment);
  const [responses, setResponses] = useState<{
    [key: number]: { value: string[]; type: QuestionTypes };
  }>(
    assessment.form.questions.reduce(
      (acc, question) => {
        const valueArray: string[] = [];
        if (question.type === "NUMERIC" || question.type === "TEXT") {
          const currentResponse = question.response[0];
          if (currentResponse && currentResponse.response) {
            valueArray.push(currentResponse.response);
          }
        } else {
          for (const currentResponse of question.ResponseOption) {
            if (currentResponse.option)
              valueArray.push(currentResponse.option.id.toString());
          }
          if (valueArray.length === 0) {
            valueArray.push("null");
          }
        }
        acc[question.id] = { value: valueArray, type: question.type };
        return acc;
      },
      {} as { [key: number]: { value: string[]; type: QuestionTypes } },
    ) || {},
  );
  const [assessmentEnded, setAssessmentEnded] = useState(false);

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

  const handleSubmitResponse = (endAssessment: boolean) => {
    const responsesArray = Object.entries(responses).map(
      ([questionId, { value, type }]) => ({
        questionId: Number(questionId),
        type,
        response: value,
      }),
    );
    void addResponses(assessment.id, responsesArray, userId, endAssessment);
    setAssessmentEnded(endAssessment);
  };

  const handleDeleteAssessment = () => {
    void deleteAssessment(assessment.id);
  };

  useEffect(() => {}, [responses, assessmentEnded]);
  const options = assessment.form.questions.flatMap((question) => {
    return question.options;
  });
  //console.log(assessment.form.questions);
  return (
    <div
      className={
        "flex h-full flex-col gap-1 overflow-auto rounded-3xl bg-gray-300/30 p-3 shadow-md"
      }
    >
      {assessment.form.questions !== null && assessmentEnded === false ?
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
                            options.filter(
                              (opt) => opt && opt.questionId === question.id,
                            ) || [];
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
                      options.filter((opt) => opt.questionId === question.id) ||
                      [];
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
          <div className="mb-2 flex items-center justify-between gap-2 rounded p-2">
            <Button
              variant={"secondary"}
              onPress={() => handleSubmitResponse(false)}
            >
              Salvar respostas
            </Button>
            <Button
              variant={"constructive"}
              type="button"
              onPress={() => handleSubmitResponse(true)}
            >
              <span className={"-mb-1"}>Salvar e finalizar</span>
            </Button>
            <Button variant={"destructive"} onPress={handleDeleteAssessment}>
              Excluir avaliação
            </Button>
          </div>
        </>
      : assessmentEnded === true ?
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
