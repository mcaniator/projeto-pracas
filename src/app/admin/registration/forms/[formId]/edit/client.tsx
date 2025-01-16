"use client";

import { QuestionForm } from "@/app/admin/registration/forms/[formId]/edit/questionForm";
import { CategoriesWithQuestions } from "@/serverActions/categorySubmit";
import { FormToEditPage, createVersion } from "@/serverActions/formUtil";
import {
  CalculationTypes,
  OptionTypes,
  QuestionResponseCharacterTypes,
  QuestionTypes,
} from "@prisma/client";
import { useEffect, useState } from "react";

import LoadingIcon from "../../../../../../components/LoadingIcon";
import { FormUpdater } from "./formUpdater";

interface DisplayQuestion {
  id: number;
  name: string;
  notes: string | null;
  type: QuestionTypes;
  characterType: QuestionResponseCharacterTypes;
  optionType: OptionTypes | null;
  options: {
    text: string;
  }[];
  category: {
    id: number;
    name: string;
  };
  subcategory: {
    id: number;
    name: string;
    categoryId: number;
  } | null;
}

interface DisplayCalculation {
  id: number;
  name: string;
  type: CalculationTypes;
  questions: {
    id: number;
    name: string;
  }[];
  category: {
    id: number;
    name: string;
  };
  subcategory: {
    id: number;
    name: string;
  } | null;
}

interface AddCalculationToAddObj {
  name: string;
  type: CalculationTypes;
  questions: {
    id: number;
    name: string;
  }[];
  category: {
    id: number;
    name: string;
  };
  subcategory: {
    id: number;
    name: string;
  } | null;
}

const Client = ({
  form,
  categories,
}: {
  form: FormToEditPage;
  categories: CategoriesWithQuestions;
}) => {
  const [updatedQuestions, setUpdatedQuestions] = useState<DisplayQuestion[]>(
    [],
  );

  const [questionsToAdd, setQuestionsToAdd] = useState<DisplayQuestion[]>([]);
  const [questionsToRemove, setQuestionsToRemove] = useState<DisplayQuestion[]>(
    [],
  );
  const [calculationsToAdd, setCalculationsToAdd] = useState<
    DisplayCalculation[]
  >([]);
  const [initialCalculations, setInitialCalculations] = useState<
    DisplayCalculation[]
  >(form.calculations);
  const [calculationsToAddIndex, setCalculationsToAddIndex] = useState(() => {
    const biggestId =
      calculationsToAdd.length > 0 ?
        Math.max(...calculationsToAdd.map((calc) => calc.id))
      : 0;
    return biggestId + 1;
  });
  const [initialCalculationsModified, setInitialCalculationsModified] =
    useState(false);

  const [isMobileView, setIsMobileView] = useState<boolean>(true);
  const [isPending, setIsPending] = useState(false);
  const handleQuestionsToAdd = (question: DisplayQuestion) => {
    const questionExists = questionsToAdd.some((q) => q.id === question.id);
    if (!questionExists) {
      setQuestionsToAdd([...questionsToAdd, question]);
      if (questionsToRemove.some((q) => q.id === question.id)) {
        setUpdatedQuestions(
          updatedQuestions.filter((q) => q.id !== question.id),
        );
      } else {
        setUpdatedQuestions([...updatedQuestions, question]);
      }
    }
  };

  const cancelAddQuestion = (questionId: number) => {
    setQuestionsToAdd((prevQuestionsToAdd) =>
      prevQuestionsToAdd.filter((q) => q.id !== questionId),
    );
    if (questionsToAdd.some((q) => q.id === questionId)) {
      setUpdatedQuestions(updatedQuestions.filter((q) => q.id !== questionId));
    }
  };

  const handleQuestionsToRemove = (questionId: number) => {
    const questionToRemove = form.questions.find((q) => q.id === questionId);
    if (questionToRemove) {
      setQuestionsToRemove([...questionsToRemove, questionToRemove]);
      setUpdatedQuestions([...updatedQuestions, questionToRemove]);
    }
  };

  useEffect(() => {
    setInitialCalculations((prev) =>
      prev.map((calc) => ({
        ...calc,
        questions: calc.questions.filter(
          (question) =>
            !questionsToRemove.some((q) => q.id === question.id) ||
            questionsToAdd.some((q) => q.id === question.id),
        ),
      })),
    );
  }, [questionsToAdd, questionsToRemove]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 1000);
    };

    window.addEventListener("resize", handleResize);
    handleResize();
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const addCalculationToAdd = (calculation: AddCalculationToAddObj) => {
    setCalculationsToAdd((prev) => [
      ...prev,
      {
        id: calculationsToAddIndex,
        name: calculation.name,
        type: calculation.type,
        category: calculation.category,
        subcategory: calculation.subcategory,
        questions: calculation.questions,
      },
    ]);
    setCalculationsToAddIndex((prev) => prev + 1);
  };

  const removeCalculationToAdd = (id: number) => {
    setCalculationsToAdd((prev) =>
      prev.filter((prevCalculation) => prevCalculation.id !== id),
    );
    setCalculationsToAddIndex((prev) => prev + 1);
  };

  const removeInitialCalculation = (id: number) => {
    setInitialCalculations((prev) =>
      prev.filter((prevCalculation) => prevCalculation.id !== id),
    );
    setInitialCalculationsModified(true);
  };

  const handleUpdateCalculationToAdd = (calculation: DisplayCalculation) => {
    setCalculationsToAdd((prev) =>
      prev.map((prevCalculation) => {
        if (calculation.id === prevCalculation.id) {
          return {
            ...prevCalculation,
            name: calculation.name,
            type: calculation.type,
            questions: calculation.questions,
          };
        }
        return prevCalculation;
      }),
    );
  };

  const handleUpdateInitialCalculation = (calculation: DisplayCalculation) => {
    setInitialCalculations((prev) =>
      prev.map((prevCalculation) => {
        if (calculation.id === prevCalculation.id) {
          return {
            ...prevCalculation,
            name: calculation.name,
            type: calculation.type,
            questions: calculation.questions,
          };
        }
        return prevCalculation;
      }),
    );
    setInitialCalculationsModified(true);
  };

  const handleCreateVersion = async (
    formId: number,
    oldQuestions: DisplayQuestion[],
    questionsToAdd: DisplayQuestion[],
    questionsToRemove: DisplayQuestion[],
  ) => {
    setIsPending(true);
    let convertedQuestions: DisplayQuestion[];
    let allQuestions: DisplayQuestion[];
    let filteredQuestions: DisplayQuestion[];

    if (oldQuestions !== null) {
      convertedQuestions = oldQuestions.map((question) => question);
      allQuestions = convertedQuestions.concat(questionsToAdd);
      filteredQuestions = allQuestions.filter(
        (question) =>
          !questionsToRemove.some(
            (removeQuestion) => removeQuestion.id === question.id,
          ),
      );
    } else {
      filteredQuestions = questionsToAdd.filter(
        (question) =>
          !questionsToRemove.some(
            (removeQuestion) => removeQuestion.id === question.id,
          ),
      );
    }

    await createVersion(
      formId,
      filteredQuestions,
      calculationsToAdd.concat(initialCalculations),
    );
  };

  return form == null ?
      <div>Formulário não encontrado</div>
    : <>
        {isPending ?
          <div className="p-5">
            <div className="flex w-full flex-col rounded-3xl bg-gray-300/30 p-3 text-white shadow-md">
              <div className="flex justify-center">
                <LoadingIcon className="h-32 w-32 text-2xl" />
              </div>
            </div>
          </div>
        : <div className="grid h-full grid-cols-5 gap-2 overflow-auto">
            <div
              className={`${isMobileView ? "col-span-5" : "col-span-3"} overflow-auto`}
            >
              <FormUpdater
                form={form}
                questionsToAdd={questionsToAdd}
                calculationsToAdd={calculationsToAdd}
                initialCalculations={initialCalculations}
                questionsToRemove={questionsToRemove}
                isMobileView={isMobileView}
                updatedQuestions={updatedQuestions}
                initialCalculationsModified={initialCalculationsModified}
                cancelAddQuestion={cancelAddQuestion}
                handleQuestionsToRemove={handleQuestionsToRemove}
                addCalculationToAdd={addCalculationToAdd}
                removeCalculationToAdd={removeCalculationToAdd}
                removeInitialCalculation={removeInitialCalculation}
                handleUpdateCalculationToAdd={handleUpdateCalculationToAdd}
                handleUpdateInitialCalculation={handleUpdateInitialCalculation}
                handleCreateVersion={handleCreateVersion}
                formId={form.id}
                initialQuestions={form.questions}
                handleQuestionsToAdd={handleQuestionsToAdd}
                categoriesToModal={categories}
              />
            </div>

            <div
              className={`col-span-2 h-full overflow-auto ${isMobileView ? "hidden" : ""}`}
            >
              <QuestionForm
                formId={form.id}
                initialQuestions={form.questions}
                handleQuestionsToAdd={handleQuestionsToAdd}
                questionsToAdd={questionsToAdd}
                questionsToRemove={questionsToRemove}
                categories={categories}
              />
            </div>
          </div>
        }
      </>;
};
export default Client;
export type { DisplayQuestion, DisplayCalculation, AddCalculationToAddObj };
