"use client";

import { Question, Response } from "@prisma/client";
import { QuestionTypes } from "@prisma/client";
import { useState } from "react";

import { ResponseEditor } from "./responseEditor";
import { AssessmentsWithResposes } from "./responseViewer";

interface ResponseWithFrequency extends Response {
  frequency: number;
}
interface ResponseWithUsername extends Response {
  username: string;
}

interface FrequencyObjByCategory {
  id: number;
  categoryName: string;
  subcategories: {
    id: number;
    subcategoryName: string;
    questions: {
      id: number;
      questionName: string;
      type: QuestionTypes;
      responses: {
        text: string;
        frequency: number;
      }[];
    }[];
  }[];
  questions: {
    id: number;
    questionName: string;
    type: QuestionTypes;
    responses: {
      text: string;
      frequency: number;
    }[];
  }[];
}

const ResponseViewerClient = ({
  locationId,
  formId,
  assessments,
}: {
  locationId: number;
  formId: number;
  assessments: AssessmentsWithResposes;
}) => {
  const [editingEnvioId, setEditingEnvioId] = useState<string | null>(null);

  const handleEditEnvio = (envioId: string | null) => {
    if (envioId === null) return;
    setEditingEnvioId(envioId);
  };

  const frequencies: FrequencyObjByCategory[] = [];
  assessments.forEach((assessment) => {
    assessment.form.questions.forEach((question) => {
      if (
        !frequencies.find((category) => category.id === question.category.id)
      ) {
        frequencies.push({
          id: question.category.id,
          categoryName: question.category.name,
          questions: [],
          subcategories: [],
        });
      }
      const currentCategoryObj = frequencies.find(
        (category) => category.id === question.category.id,
      );
      if (currentCategoryObj !== undefined) {
        if (
          question.subcategory &&
          currentCategoryObj.subcategories.find(
            (subcategory) => subcategory.id === question.subcategory.id,
          ) === undefined
        ) {
          currentCategoryObj.subcategories.push({
            id: question.subcategory.id,
            subcategoryName: question.subcategory.name,
            questions: [],
          });
        }
        if (question.subcategory) {
          const currentSubcategoryObj = currentCategoryObj.subcategories.find(
            (subcategory) => subcategory.id === question.subcategory.id,
          );
          if (currentSubcategoryObj) {
            if (
              currentSubcategoryObj.questions.find(
                (subcategoryQuestion) => subcategoryQuestion.id === question.id,
              ) === undefined
            ) {
              currentSubcategoryObj.questions.push({
                id: question.id,
                questionName: question.name,
                type: question.type,
                responses: [],
              });
            }
            const currentQuestionObj = currentSubcategoryObj.questions.find(
              (subcategoryQuestion) => subcategoryQuestion.id === question.id,
            );
            if (currentQuestionObj !== undefined) {
              if (question.type === "OPTIONS") {
                question.options.forEach((option) => {
                  if (
                    !currentQuestionObj.responses.find(
                      (response) => response.text === option.text,
                    )
                  ) {
                    currentQuestionObj.responses.push({
                      text: option.text,
                      frequency: 0,
                    });
                  }
                });
                const assessmentResponsesOption =
                  assessment.responseOption.filter(
                    (responseOption) =>
                      responseOption.questionId === question.id,
                  );
                assessmentResponsesOption.forEach(
                  (assessmentResponseOption) => {
                    const currentResponseObj =
                      currentQuestionObj.responses.find(
                        (response) =>
                          response.text ===
                          assessmentResponseOption.option?.text,
                      );
                    if (currentResponseObj) {
                      currentResponseObj.frequency++;
                    }
                  },
                );
              } else {
                const assessmentResponse = assessment.response.find(
                  (response) => response.questionId === question.id,
                );
                if (assessmentResponse && assessmentResponse.response) {
                  if (
                    currentQuestionObj.responses.find(
                      (questionResponse) =>
                        questionResponse.text === assessmentResponse.response,
                    ) === undefined
                  ) {
                    currentQuestionObj.responses.push({
                      text: assessmentResponse.response,
                      frequency: 0,
                    });
                  }
                  const currentResponseObj = currentQuestionObj.responses.find(
                    (questionResponse) =>
                      questionResponse.text === assessmentResponse.response,
                  );
                  if (currentResponseObj) {
                    currentResponseObj.frequency++;
                  }
                }
              }
            }
          }
        } else {
          if (
            currentCategoryObj.questions.find(
              (categoryQuestion) => categoryQuestion.id === question.id,
            ) === undefined
          ) {
            currentCategoryObj.questions.push({
              id: question.id,
              questionName: question.name,
              type: question.type,
              responses: [],
            });
          }
          const currentQuestionObj = currentCategoryObj.questions.find(
            (categoryQuestion) => categoryQuestion.id === question.id,
          );
          if (currentQuestionObj !== undefined) {
            if (question.type === "OPTIONS") {
              question.options.forEach((option) => {
                if (
                  !currentQuestionObj.responses.find(
                    (response) => response.text === option.text,
                  )
                ) {
                  currentQuestionObj.responses.push({
                    text: option.text,
                    frequency: 0,
                  });
                }
              });
              const assessmentResponsesOption =
                assessment.responseOption.filter(
                  (responseOption) => responseOption.questionId === question.id,
                );
              assessmentResponsesOption.forEach((assessmentResponseOption) => {
                const currentResponseObj = currentQuestionObj.responses.find(
                  (response) =>
                    response.text === assessmentResponseOption.option?.text,
                );
                if (currentResponseObj) {
                  currentResponseObj.frequency++;
                }
              });
            } else {
              const assessmentResponse = assessment.response.find(
                (response) => response.questionId === question.id,
              );
              if (assessmentResponse && assessmentResponse.response) {
                if (
                  currentQuestionObj.responses.find(
                    (questionResponse) =>
                      questionResponse.text === assessmentResponse.response,
                  ) === undefined
                ) {
                  currentQuestionObj.responses.push({
                    text: assessmentResponse.response,
                    frequency: 0,
                  });
                }
                const currentResponseObj = currentQuestionObj.responses.find(
                  (questionResponse) =>
                    questionResponse.text === assessmentResponse.response,
                );
                if (currentResponseObj) {
                  currentResponseObj.frequency++;
                }
              }
            }
          }
        }
      }
    });
  });
  /*assessments.forEach((assessment) => {
    assessment.response.forEach((response) => {
      if (!frequencies[response.questionId]) {
        frequencies[response.questionId] = {};
      }
      const currentQuestionObj = frequencies[response.questionId];
      if (currentQuestionObj && response.response) {
        let currentResponseObj = currentQuestionObj[response.response];

        if (currentResponseObj !== undefined) {
          currentResponseObj++;
        }
        currentQuestionObj[response.response] = currentResponseObj || 1;
      }
    });
    assessment.form.questions.forEach((question)=>{
     
      if(question.type === "OPTIONS"){
        if (!frequencies[question.id]) {
          frequencies[question.id] = {};
        }
        const currentQuestionObj = frequencies[question.id]

      }
    })
    assessment.responseOption.forEach((responseOption) => {
      if (!frequencies[responseOption.questionId]) {
        frequencies[responseOption.questionId] = {};
      }
      const currentQuestionObj = frequencies[responseOption.questionId];
      if (currentQuestionObj && responseOption.option?.text) {
        let currentResponseObj =
          currentQuestionObj[responseOption.option?.text];

        if (currentResponseObj !== undefined) {
          currentResponseObj++;
        }
        currentQuestionObj[responseOption.option?.text] =
          currentResponseObj || 1;
      }
    });
  });*/

  return (
    <div className="flex gap-5">
      <div
        className={
          "flex basis-3/5 flex-col gap-1 overflow-auto rounded-3xl bg-gray-300/30 p-3 shadow-md"
        }
      >
        <ul className="list-disc p-3">
          {frequencies.map((category) => {
            return (
              <div key={category.id}>
                <span className="text-2xl font-bold">
                  {category.categoryName}
                </span>
                {category.questions.map((question) => {
                  return (
                    <div key={question.id} className="flex flex-col">
                      <span className="font-bold">{question.questionName}</span>

                      {question.responses.map((response) => {
                        return (
                          <span key={response.text}>
                            {response.text}
                            <span className="font-bold text-blue-500">{`Frequência: ${response.frequency}`}</span>
                          </span>
                        );
                      })}
                    </div>
                  );
                })}
                {category.subcategories.map((subcategory) => {
                  return (
                    <div key={subcategory.id}>
                      <span className="text-xl font-bold">
                        {subcategory.subcategoryName}
                      </span>

                      {subcategory.questions.map((question) => {
                        return (
                          <div key={question.id} className="flex flex-col">
                            <span className="font-bold">
                              {question.questionName}
                            </span>

                            {question.responses.map((response) => {
                              return (
                                <span key={`${question.id}-${response.text}`}>
                                  {response.text}
                                  <span className="font-bold text-blue-500">{`Frequência: ${response.frequency}`}</span>
                                </span>
                              );
                            })}
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            );
          })}
          {/*assessments.flatMap((assessment) =>
            assessment.form.questions.map((question) => (
              <li key={question.id}>
                <div>{question.name}</div>
                <div>
                  {question.type === QuestionTypes.OPTIONS ?
                    <div>
                      {question.options.map((option) => (
                        <div key={option.id}>
                          <span>{option.text}</span>
                          <span className="font-bold text-blue-500">
                            {" "}
                            Frequência:{" "}
                            {
                              frequencies[question.id][
                                assessment.responseOption.find(
                                  (ro) => ro.optionId === question.id,
                                )?.option?.text || 1
                              ]
                            }
                          </span>
                        </div>
                      ))}
                    </div>
                  : (
                    assessment.response.find(
                      (response) => response.questionId === question.id,
                    )
                  ) ?
                    assessment.response
                      .filter((response) => response.questionId === question.id)
                      .map((response, index) => {
                        return (
                          <div key={index}>
                            {(
                              question.type === QuestionTypes.NUMERIC ||
                              question.type === QuestionTypes.TEXT
                            ) ?
                              <div>
                                <span>{response.response}</span>
                                <span className="font-bold text-blue-500">
                                  {" "}
                                  Frequência:{" "}
                                  {
                                    frequencies[question.id][
                                      assessment.responseOption.find(
                                        (ro) => ro.optionId === question.id,
                                      )?.option?.text || 1
                                    ]
                                  }
                                </span>
                              </div>
                            : <div>{response.response}</div>}
                          </div>
                        );
                      })
                  : <div>Não há respostas para esta pergunta</div>}
                </div>
              </li>
            )),
          )*/}
        </ul>
      </div>

      <div className="flex basis-2/5 flex-col gap-3">
        <h3 className="text-lg font-bold">3 Envios Mais Recentes</h3>
        {/*recentEnvios.map((envio, index) => {
          const envioDateString = envio.envioId.split(",")[0];
          let formattedTimeString = "";
          if (envioDateString) {
            const envioDate = new Date(envioDateString);
            const formattedDate = envioDate.toLocaleDateString("pt-BR", {
              day: "2-digit",
              month: "2-digit",
              year: "2-digit",
            });
            const formattedTime = envioDate.toLocaleTimeString("pt-BR", {
              hour: "2-digit",
              minute: "2-digit",
            });
            formattedTimeString += `${formattedDate} às ${formattedTime}`;
          }

          const isEditing = editingEnvioId === envio.envioId;

          return (
            <div
              key={index}
              className="rounded-lg bg-transparent p-3 shadow-md"
            >
              <h4 className="font-semibold">Envio em: {formattedTimeString}</h4>
              <h4 className="font-semibold">
                Por: {envio.responses[0]?.username}
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
        })*/}
      </div>
    </div>
  );
};

export { ResponseViewerClient };
