"use client";

import { QuestionForm } from "@/app/admin/registration/forms/[formId]/edit/questionForm";
import LoadingIcon from "@components/LoadingIcon";
import { useHelperCard } from "@components/context/helperCardContext";
import { FormCalculation, FormQuestion } from "@customTypes/forms/formCreation";
import { CalculationTypes } from "@prisma/client";
import { CategoriesWithQuestionsAndStatusCode } from "@queries/category";
import { FormToEditPage } from "@queries/form";
import { _createVersion } from "@serverActions/formUtil";
import { useEffect, useState } from "react";

import { FormUpdater } from "./formUpdater";

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
  categories: CategoriesWithQuestionsAndStatusCode;
}) => {
  const { setHelperCard } = useHelperCard();
  const [updatedQuestions, setUpdatedQuestions] = useState<FormQuestion[]>([]);

  const [questionsToAdd, setQuestionsToAdd] = useState<FormQuestion[]>([]);
  const [questionsToRemove, setQuestionsToRemove] = useState<FormQuestion[]>(
    [],
  );
  const [calculationsToAdd, setCalculationsToAdd] = useState<FormCalculation[]>(
    [],
  );
  const [initialCalculations, setInitialCalculations] = useState<
    FormCalculation[]
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
  const [loadingView, setLoadingView] = useState(true);
  const [isPending, setIsPending] = useState(false);
  const handleQuestionsToAdd = (question: FormQuestion) => {
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
    const questionToRemove = form.formQuestions.find(
      (fq) => fq.question.id === questionId,
    )?.question;
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

  useEffect(() => {
    setLoadingView(false);
  }, [isMobileView]);

  useEffect(() => {
    if (categories.statusCode !== 200) {
      if (categories.statusCode === 401) {
        setHelperCard({
          show: true,
          helperCardType: "ERROR",
          content: <>Sem permissão para obter categorias!</>,
        });
      } else {
        setHelperCard({
          show: true,
          helperCardType: "ERROR",
          content: <>Erro ao obter categorias!</>,
        });
      }
    }
  }, [categories, setHelperCard]);

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

  const handleUpdateCalculationToAdd = (calculation: FormCalculation) => {
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

  const handleUpdateInitialCalculation = (calculation: FormCalculation) => {
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
    oldQuestions: FormQuestion[],
    questionsToAdd: FormQuestion[],
    questionsToRemove: FormQuestion[],
  ) => {
    setIsPending(true);
    let convertedQuestions: FormQuestion[];
    let allQuestions: FormQuestion[];
    let filteredQuestions: FormQuestion[];

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

    const createObj = await _createVersion(
      formId,
      filteredQuestions,
      calculationsToAdd.concat(initialCalculations),
    );

    if (createObj.statusCode !== 201) {
      if (createObj.statusCode === 401) {
        setHelperCard({
          show: true,
          helperCardType: "ERROR",
          content: <>Sem permissão para criar formulários!</>,
        });
      } else {
        setHelperCard({
          show: true,
          helperCardType: "ERROR",
          content: <>Erro ao criar nova versão do formulário!</>,
        });
      }
    }
  };

  return form == null ?
      <div>Formulário não encontrado</div>
    : <>
        {isPending || loadingView ?
          <div className="p-5">
            <div className="flex w-full flex-col rounded-3xl bg-gray-300/30 p-3 shadow-md">
              <div className="flex justify-center">
                <LoadingIcon className="h-32 w-32 text-2xl" />
              </div>
            </div>
          </div>
        : <div className="grid h-full grid-cols-5 gap-2 overflow-auto">
            <div
              className={`${
                isMobileView ? "col-span-5" : "col-span-3"
              } overflow-auto`}
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
                initialQuestions={form.formQuestions.map((fq) => fq.question)}
                handleQuestionsToAdd={handleQuestionsToAdd}
                categoriesToModal={categories.categories}
              />
            </div>
            <div
              className={`col-span-2 h-full overflow-auto ${isMobileView ? "hidden" : ""}`}
            >
              <QuestionForm
                formId={form.id}
                initialQuestions={form.formQuestions.map((fq) => fq.question)}
                handleQuestionsToAdd={handleQuestionsToAdd}
                questionsToAdd={questionsToAdd}
                questionsToRemove={questionsToRemove}
                categories={categories.categories}
              />
            </div>
          </div>
        }
      </>;
};
export default Client;
export { type AddCalculationToAddObj };
