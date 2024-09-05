import { AssessmentsWithResposes } from "@/serverActions/assessmentUtil";
import { QuestionTypes } from "@prisma/client";

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

const FrequencyTable = ({
  assessments,
}: {
  assessments: AssessmentsWithResposes;
}) => {
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
  return (
    <div
      className={
        "flex basis-3/5 flex-col gap-1 overflow-auto rounded-3xl bg-gray-300/30 p-3 shadow-md"
      }
    >
      <h3 className="text-2xl font-semibold">Dados somados</h3>
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

                    {question.responses.length === 0 ?
                      <span>SEM RESPOSTA</span>
                    : question.responses.map((response) => {
                        return (
                          <span key={response.text}>
                            {response.text}
                            <span className="font-bold text-blue-500">{`Frequência: ${response.frequency}`}</span>
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
                    <span className="text-xl font-bold">
                      {subcategory.subcategoryName}
                    </span>

                    {subcategory.questions.map((question) => {
                      return (
                        <div key={question.id} className="flex flex-col">
                          <span className="font-bold">
                            {question.questionName}
                          </span>

                          {question.responses.length === 0 ?
                            <span>SEM RESPOSTA</span>
                          : question.responses.map((response) => {
                              return (
                                <span key={`${question.id}-${response.text}`}>
                                  {response.text}
                                  <span className="font-bold text-blue-500">{`Frequência: ${response.frequency}`}</span>
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
