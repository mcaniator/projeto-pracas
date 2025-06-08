"use client";

import { AssessmentsWithResposes } from "@/serverActions/assessmentUtil";
import { OptionTypes, QuestionTypes } from "@prisma/client";
import { IconHelp } from "@tabler/icons-react";
import { useState } from "react";

import { Button } from "../../../../../../../components/button";
import { ResponseCalculation } from "../../../evaluation/[selectedFormId]/[selectedAssessmentId]/responseComponent";

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
      optionType: OptionTypes | null;
      responses: {
        text: string;
        frequency: number;
      }[];
    }[];
    calculations: ResponseCalculation[];
  }[];
  questions: {
    id: number;
    questionName: string;
    type: QuestionTypes;
    optionType: OptionTypes | null;
    responses: {
      text: string;
      frequency: number;
    }[];
  }[];
  calculations: ResponseCalculation[];
}

const FrequencyTable = ({
  assessments,
}: {
  assessments: AssessmentsWithResposes["assessments"];
}) => {
  const [showHelp, setShowHelp] = useState(false);
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
          calculations: [],
        });
      }
      const currentCategoryObj = frequencies.find(
        (category) => category.id === question.category.id,
      );
      if (currentCategoryObj !== undefined) {
        const questionSubcategory = question.subcategory;
        if (
          questionSubcategory &&
          currentCategoryObj.subcategories.find(
            (subcategory) => subcategory.id === questionSubcategory.id,
          ) === undefined
        ) {
          currentCategoryObj.subcategories.push({
            id: questionSubcategory.id,
            subcategoryName: questionSubcategory.name,
            questions: [],
            calculations: [],
          });
        }
        if (questionSubcategory) {
          const currentSubcategoryObj = currentCategoryObj.subcategories.find(
            (subcategory) => subcategory.id === questionSubcategory.id,
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
                optionType: question.optionType,
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
              optionType: question.optionType,
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
  return (
    <div className="h-full overflow-auto">
      <div className="flex items-center">
        <h3 className="text-2xl font-semibold">Dados somados</h3>
        <Button
          variant={"ghost"}
          className="group relative"
          onPress={() => setShowHelp((prev) => !prev)}
        >
          <IconHelp />
          <div
            className={`absolute -left-7 top-10 w-[40vw] rounded-lg bg-black px-3 py-1 text-sm shadow-md transition-opacity duration-200 group-hover:opacity-100 sm:left-5 sm:w-[25vw] ${showHelp ? "opacity-100" : "opacity-0"}`}
          >
            O número ao lado de cada resposta corresponde à quantidade de vezes
            que aquela resposta foi dada no conjunto de avaliações.
          </div>
        </Button>
      </div>

      <ul className="list-disc p-3 text-sm sm:text-base">
        {frequencies.map((category) => {
          return (
            <div key={category.id}>
              <span className="text-xl font-bold sm:text-2xl">
                {category.categoryName}
              </span>
              {category.questions.map((question) => {
                return (
                  <div key={question.id} className="my-4 flex flex-col">
                    <span className="font-bold">{question.questionName}</span>

                    {question.responses.length === 0 ?
                      <span>SEM RESPOSTA</span>
                    : question.responses.map((response) => {
                        return (
                          <span key={response.text}>
                            {response.text}
                            <span className="font-bold">{` (x${response.frequency})`}</span>
                          </span>
                        );
                      })
                    }
                  </div>
                );
              })}
              {category.subcategories.map((subcategory) => {
                return (
                  <div key={subcategory.id}>
                    <span className="text-lg font-bold sm:text-xl">
                      {subcategory.subcategoryName}
                    </span>

                    {subcategory.questions.map((question) => {
                      return (
                        <div key={question.id} className="my-4 flex flex-col">
                          <span className="font-bold">
                            {question.questionName}
                          </span>

                          {question.responses.length === 0 ?
                            <span>SEM RESPOSTA</span>
                          : question.responses.map((response) => {
                              return (
                                <span key={`${question.id}-${response.text}`}>
                                  {response.text}
                                  <span className="font-bold">{` (x${response.frequency})`}</span>
                                </span>
                              );
                            })
                          }
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          );
        })}
      </ul>
    </div>
  );
};

export { FrequencyTable };
export { type FrequencyObjByCategory };
