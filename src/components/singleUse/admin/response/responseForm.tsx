"use client";

import {
  AssessmentWithResposes,
  CategoryWithSubcategoryAndQuestion,
  FetchedAssessmentGeometries,
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
import {
  IconDeviceFloppy,
  IconFileCheck,
  IconTrash,
} from "@tabler/icons-react";
import Link from "next/link";
import { Coordinate } from "ol/coordinate";
import { Type } from "ol/geom/Geometry";
import React from "react";
import { useEffect, useState } from "react";

import { MapPopup } from "./MapPopup";

interface ModalGeometry {
  type: Type;
  coordinates: Coordinate | Coordinate[][];
}

type ResponseGeometry = "POINT" | "POLYGON" | "POINT_AND_POLYGON";

const ResponseForm = ({
  userId,
  locationId,
  categoriesObj,
  assessment,
  fetchedGeometries,
}: {
  userId: string;
  locationId: number;
  categoriesObj: CategoryWithSubcategoryAndQuestion[];
  assessment: AssessmentWithResposes;
  fetchedGeometries: FetchedAssessmentGeometries;
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

  const [geometries, setGeometries] = useState<
    { questionId: number; geometries: ModalGeometry[] }[]
  >(() => {
    return fetchedGeometries.map((fetchedGeometry) => {
      const { questionId, geometry } = fetchedGeometry;
      if (!geometry) {
        return { questionId, geometries: [] };
      }
      const geometries: ModalGeometry[] = [];
      const geometriesWithoutCollection = geometry
        .replace("GEOMETRYCOLLECTION(", "")
        .slice(0, -1);
      const regex = /(?:POINT|POLYGON)\([^)]*\)+/g;
      const geometriesStrs = geometriesWithoutCollection.match(regex);
      if (geometriesStrs) {
        for (const geometry of geometriesStrs) {
          if (geometry.startsWith("POINT")) {
            const geometryPointsStr = geometry
              .replace("POINT(", "")
              .replace(")", "");
            const geometryPoints = geometryPointsStr.split(" ");
            const geometryPointsNumber: number[] = [];
            for (const geo of geometryPoints) {
              geometryPointsNumber.push(Number(geo));
            }
            geometries.push({
              type: "Point",
              coordinates: geometryPointsNumber,
            });
          } else if (geometry.startsWith("POLYGON")) {
            const geometryRingsStr = geometry
              .replace("POLYGON(", " ")
              .slice(0, -1);
            const ringsStrs = geometryRingsStr.split("),(");
            const ringsCoordinates: Coordinate[][] = [];
            for (const ring of ringsStrs) {
              const geometryPointsStr = ring.split(",");
              const geometryPointsCoordinates: Coordinate[] = [];
              for (const point of geometryPointsStr) {
                const pointClean = point
                  .replace("(", "")
                  .replace(")", "")
                  .trim();
                const geometryPoints = pointClean.split(" ");
                const geometryPointsNumber: number[] = [];
                for (const geo of geometryPoints) {
                  geometryPointsNumber.push(Number(geo));
                }
                geometryPointsCoordinates.push(geometryPointsNumber);
              }
              ringsCoordinates.push(geometryPointsCoordinates);
            }
            geometries.push({ type: "Polygon", coordinates: ringsCoordinates });
          }
        }
      }

      return { questionId, geometries: geometries };
    });
  });
  const handleQuestionGeometryChange = (
    questionId: number,
    modalGeometries: ModalGeometry[] | undefined,
  ) => {
    if (!modalGeometries) return;
    setGeometries((prev) => {
      if (prev.some((p) => p.questionId === questionId)) {
        return prev.map((p) => {
          if (p.questionId === questionId) {
            return { questionId: questionId, geometries: modalGeometries };
          } else {
            return p;
          }
        });
      } else {
        prev.push({ questionId: questionId, geometries: modalGeometries });
        return [...prev];
      }
    });
  };

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
    void addResponses(
      assessment.id,
      responsesArray,
      geometries,
      userId,
      endAssessment,
    );
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
    <div>
      {assessment.form.questions !== null && assessmentEnded === false ?
        <>
          {categoriesObj.map((category) => {
            return (
              <React.Fragment key={category.id}>
                <h3 className="text-xl font-bold">{category.name}</h3>
                <ul className="list-disc p-3">
                  {category.questions.map((question) => {
                    {
                      question.geometryTypes.length > 0 && (
                        <MapPopup
                          questionId={question.id}
                          initialGeometries={
                            geometries.find((g) => g.questionId === question.id)
                              ?.geometries
                          }
                          geometryType={
                            question.geometryTypes.length > 1 ?
                              "POINT_AND_POLYGON"
                            : question.geometryTypes[0]!
                          }
                          handleQuestionGeometryChange={
                            handleQuestionGeometryChange
                          }
                        />
                      );
                    }
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
                            type={
                              question.characterType === "TEXT" ?
                                "text"
                              : "number"
                            }
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
                              {question.geometryTypes.length > 0 && (
                                <span className="px-2">
                                  <MapPopup
                                    questionId={question.id}
                                    initialGeometries={
                                      geometries.find(
                                        (g) => g.questionId === question.id,
                                      )?.geometries
                                    }
                                    geometryType={
                                      question.geometryTypes.length > 1 ?
                                        "POINT_AND_POLYGON"
                                      : question.geometryTypes[0]!
                                    }
                                    handleQuestionGeometryChange={
                                      handleQuestionGeometryChange
                                    }
                                  />
                                </span>
                              )}
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
                                  type={
                                    question.characterType === "TEXT" ?
                                      "text"
                                    : "number"
                                  }
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
                <IconDeviceFloppy />
              </Button>
            )}

            <Button
              variant={"constructive"}
              type="button"
              onPress={() => handleSubmitResponse(true)}
            >
              <p>
                <IconDeviceFloppy className="inline" /> +{" "}
                <IconFileCheck className="inline" />
              </p>
            </Button>
            <Button variant={"destructive"} onPress={handleDeleteAssessment}>
              <IconTrash />
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
export { type ModalGeometry, type ResponseGeometry };
