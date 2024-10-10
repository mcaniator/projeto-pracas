"use client";

import {
  AssessmentWithResposes,
  CategoryWithSubcategoryAndQuestion,
  ResponseCalculation,
} from "@/app/admin/parks/[locationId]/evaluation/[selectedFormId]/[selectedAssessmentId]/responseComponent";
import { Button } from "@/components/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  deleteAssessment,
  redirectToFormsList,
} from "@/serverActions/assessmentUtil";
import { addResponses } from "@/serverActions/responseUtil";
import { QuestionTypes } from "@prisma/client";
import Link from "next/link";
import React from "react";
import { useEffect, useState } from "react";

const ResponseForm = ({
  userId,
  locationId,
  categoriesObj,
  assessment,
}: {
  userId: string;
  locationId: number;
  categoriesObj: CategoryWithSubcategoryAndQuestion[];
  assessment: AssessmentWithResposes;
}) => {
  const [responses, setResponses] = useState<{
    [key: number]: { value: string[]; type: QuestionTypes };
  }>(
    assessment.form.questions.reduce(
      (acc, question) => {
        const valueArray: string[] = [];
        if (question.type === "WRITTEN") {
          const currentResponseArray = assessment.response.filter(
            (respose) => respose.questionId === question.id,
          );
          const currentResponse = currentResponseArray[0];
          if (currentResponse && currentResponse.response) {
            valueArray.push(currentResponse.response);
          }
        } else {
          const currentResponseArray = assessment.responseOption.filter(
            (resposeOption) => resposeOption.questionId === question.id,
          );
          for (const currentResponse of currentResponseArray) {
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
  const handleRadialButtonResponseChange = (
    questionId: number,
    questionType: QuestionTypes,
    value: string,
  ) => {
    const currentQuestionResponsesObj = responses[questionId];
    if (currentQuestionResponsesObj) {
      if (currentQuestionResponsesObj.value.includes(value)) {
        setResponses((prevResponses) => {
          return {
            ...prevResponses,
            [questionId]: { value: ["null"], type: questionType },
          };
        });
      } else {
        setResponses((prevResponses) => {
          const valueArray: string[] = [value];
          return {
            ...prevResponses,
            [questionId]: { value: valueArray, type: questionType },
          };
        });
      }
    } else {
      setResponses((prevResponses) => {
        const valueArray: string[] = [value];
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
    redirectToFormsList(locationId);
  };

  const calculateSum = (calculation: ResponseCalculation) => {
    let sum = 0;
    calculation.questions.forEach((question) => {
      const questionResponse = responses[question.id];
      if (questionResponse) {
        if (question.type === "WRITTEN") {
          questionResponse.value.forEach((v) => {
            const questionResponseValue = Number(v);
            if (!Number.isNaN(questionResponseValue)) {
              sum += questionResponseValue;
            }
          });
        } else {
          const questionOptions =
            options.filter((opt) => opt && opt.questionId === question.id) ||
            [];
          questionResponse.value.forEach((v) => {
            const questionResponseValue = Number(
              questionOptions.find((opt) => opt.id === Number(v))?.text,
            );
            if (!Number.isNaN(questionResponseValue)) {
              sum += questionResponseValue;
            }
          });
        }
      }
    });
    return sum;
  };

  const calculateAverage = (calculation: ResponseCalculation) => {
    let sum = 0;
    let questionsAmount = 0;
    calculation.questions.forEach((question) => {
      const questionResponse = responses[question.id];
      if (questionResponse) {
        if (question.type === "WRITTEN") {
          questionResponse.value.forEach((v) => {
            const questionResponseValue = Number(v);
            if (!Number.isNaN(questionResponseValue)) {
              sum += questionResponseValue;
              questionsAmount++;
            }
          });
        } else {
          const questionOptions =
            options.filter((opt) => opt && opt.questionId === question.id) ||
            [];
          questionResponse.value.forEach((v) => {
            const questionResponseValue = Number(
              questionOptions.find((opt) => opt.id === Number(v))?.text,
            );
            if (!Number.isNaN(questionResponseValue)) {
              sum += questionResponseValue;
              questionsAmount++;
            }
          });
        }
      }
    });

    const average = sum / questionsAmount;
    if (Number.isNaN(average)) {
      return 0;
    }
    return average;
  };

  const calculatePercentages = (calculation: ResponseCalculation) => {
    const responsesByQuestion = new Map<string, number>();
    let sum = 0;
    calculation.questions.forEach((question) => {
      const questionResponse = responses[question.id];
      if (questionResponse) {
        if (question.type === "WRITTEN") {
          questionResponse.value.forEach((v) => {
            const questionResponseValue = Number(v);
            if (!Number.isNaN(questionResponseValue)) {
              sum += questionResponseValue;
              responsesByQuestion.set(question.name, questionResponseValue);
            }
          });
        } else {
          const questionOptions =
            options.filter((opt) => opt && opt.questionId === question.id) ||
            [];
          questionResponse.value.forEach((v) => {
            const questionResponseValue = Number(
              questionOptions.find((opt) => opt.id === Number(v))?.text,
            );
            if (!Number.isNaN(questionResponseValue)) {
              sum += questionResponseValue;
              responsesByQuestion.set(question.name, questionResponseValue);
            }
          });
        }
      }
    });
    let percentagesStr = "";
    responsesByQuestion.forEach(
      (value, key) =>
        (percentagesStr +=
          `${key}: ` +
          `${!Number.isNaN(value / sum) ? ((value / sum) * 100).toFixed(2) : "0"}%` +
          ", "),
    );
    return percentagesStr;
  };
  useEffect(() => {}, [responses, assessmentEnded]);
  const options = assessment.form.questions.flatMap((question) => {
    return question.options;
  });
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
                                    onClick={() =>
                                      handleRadialButtonResponseChange(
                                        question.id,
                                        question.type,
                                        String(option.id),
                                      )
                                    }
                                    readOnly
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
                {category.calculations.length > 0 && (
                  <div>
                    <h5>Calculos:</h5>
                    <ul className="list-disc p-3">
                      {category.calculations.map((calculation) => {
                        return (
                          <li key={calculation.id}>
                            <span>{calculation.name + ": "} </span>
                            {calculation.type === "SUM" && (
                              <span>{calculateSum(calculation)}</span>
                            )}
                            {calculation.type === "AVERAGE" && (
                              <span>{calculateAverage(calculation)}</span>
                            )}
                            {calculation.type === "PERCENTAGE" && (
                              <div>{calculatePercentages(calculation)}</div>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}

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
                                          onClick={() =>
                                            handleRadialButtonResponseChange(
                                              question.id,
                                              question.type,
                                              String(option.id),
                                            )
                                          }
                                          readOnly
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
                      {subcategory.calculations.length > 0 && (
                        <div>
                          <h5>Cálculos:</h5>
                          <ul className="list-disc p-3">
                            {subcategory.calculations.map((calculation) => {
                              return (
                                <li key={calculation.id}>
                                  <span>{calculation.name + ": "} </span>
                                  {calculation.type === "SUM" && (
                                    <span>{calculateSum(calculation)}</span>
                                  )}
                                  {calculation.type === "AVERAGE" && (
                                    <span>{calculateAverage(calculation)}</span>
                                  )}
                                  {calculation.type === "PERCENTAGE" && (
                                    <div>
                                      {calculatePercentages(calculation)}
                                    </div>
                                  )}
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                      )}
                    </React.Fragment>
                  );
                })}
              </React.Fragment>
            );
          })}
          <div className="mb-2 flex items-center justify-between gap-2 rounded p-2">
            {assessment.endDate === null && (
              <Button
                variant={"secondary"}
                onPress={() => handleSubmitResponse(false)}
              >
                Salvar respostas
              </Button>
            )}

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
