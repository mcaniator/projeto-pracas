"use client";

import { Button } from "@/components/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { _searchQuestionsByCategoryAndSubcategory } from "@apiCalls/question";
import LoadingIcon from "@components/LoadingIcon";
import { useHelperCard } from "@components/context/helperCardContext";
import { FormQuestion } from "@customTypes/forms/formCreation";
import {
  OptionTypes,
  Question,
  QuestionResponseCharacterTypes,
  QuestionTypes,
} from "@prisma/client";
import { CategoriesWithQuestions } from "@queries/category";
import { _searchQuestionsByStatement } from "@serverActions/questionUtil";
import { IconCirclePlus, IconX } from "@tabler/icons-react";
import { useDeferredValue, useEffect, useState } from "react";

type SearchMethods = "CATEGORY" | "STATEMENT";

const QuestionForm = ({
  formId,
  initialQuestions,
  handleQuestionsToAdd,
  questionsToAdd,
  questionsToRemove,
  categories,
}: {
  formId?: number;
  initialQuestions: Question[] | null;
  handleQuestionsToAdd: (question: FormQuestion) => void;
  questionsToAdd: FormQuestion[];
  questionsToRemove: FormQuestion[];
  categories: CategoriesWithQuestions;
}) => {
  const { setHelperCard } = useHelperCard();
  const [questionsListState, setQuestionsListState] = useState<
    "LOADING" | "LOADED" | "ERROR"
  >("LOADING");
  const [targetQuestion, setTargetQuestion] = useState("");
  const [debouncedTargetQuestion, setDebouncedTargetQuestion] = useState("");

  const [currentSearchMethod, setCurrentSearchMethod] =
    useState<SearchMethods>("CATEGORY");
  const [foundQuestions, setFoundQuestions] = useState<FormQuestion[]>([]);
  const [foundQuestionsByCategory, setFoundQuestionsByCategory] = useState<
    FormQuestion[]
  >([]);

  const [
    selectedCategoryAndSubcategoryId,
    setSelectedCategoryAndSubcategoryId,
  ] = useState<{
    categoryId: number | undefined;
    subcategoryId: number | undefined;
    verifySubcategoryNullness: boolean;
  }>({
    categoryId: categories[0]?.id,
    subcategoryId: undefined,
    verifySubcategoryNullness: false,
  });

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedTargetQuestion(targetQuestion);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [targetQuestion]);

  useEffect(() => {
    setQuestionsListState("LOADING");
    _searchQuestionsByStatement(debouncedTargetQuestion)
      .then((questions) => {
        setQuestionsListState("LOADED");
        setFoundQuestions(questions.questions);
      })
      .catch(() => {
        setQuestionsListState("ERROR");
      });
  }, [debouncedTargetQuestion]);
  useEffect(() => {
    setQuestionsListState("LOADING");
    _searchQuestionsByCategoryAndSubcategory({
      categoryId: selectedCategoryAndSubcategoryId.categoryId,
      subcategoryId: selectedCategoryAndSubcategoryId.subcategoryId,
      verifySubcategoryNullness:
        selectedCategoryAndSubcategoryId.verifySubcategoryNullness,
    })
      .then((questions) => {
        if (questions.statusCode === 200) {
          setQuestionsListState("LOADED");
          setFoundQuestionsByCategory(questions.questions);
        } else {
          if (questions.statusCode === 401) {
            setHelperCard({
              show: true,
              helperCardType: "ERROR",
              content: <>Não possui permissão para obter questões!</>,
            });
          } else {
            setHelperCard({
              show: true,
              helperCardType: "ERROR",
              content: <>Erro ao obter questões!</>,
            });
          }
          setQuestionsListState("LOADED");
          setFoundQuestionsByCategory([]);
        }
      })
      .catch(() => {
        setQuestionsListState("ERROR");
      });
  }, [selectedCategoryAndSubcategoryId, setHelperCard]);

  const deferredFoundQuestions = useDeferredValue(foundQuestions);

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCategoryAndSubcategoryId({
      ...selectedCategoryAndSubcategoryId,
      categoryId: Number(e.target.value),
    });
  };
  const handleSubcategoryChange = (e: number | string) => {
    const subcategory =
      e === "NULL" || e === "ALL" ? undefined
      : typeof e === "number" ? e
      : parseInt(e);
    setSelectedCategoryAndSubcategoryId({
      ...selectedCategoryAndSubcategoryId,
      subcategoryId: subcategory,
      verifySubcategoryNullness: e === "ALL" ? false : true,
    });
  };
  // TODO: add error handling
  return (
    <div className={"flex h-full flex-grow gap-5 overflow-auto"}>
      <div className="flex basis-full flex-col gap-5 overflow-auto">
        <div
          className={
            "flex flex-col gap-1 overflow-auto rounded-3xl bg-gray-300/30 p-3 shadow-md"
          }
        >
          <h3 className={"text-2xl font-semibold"}>Busca de Perguntas</h3>
          <div>
            <div className="inline-flex w-auto gap-1 rounded-xl bg-gray-400/20 py-1 shadow-inner">
              <Button
                variant={"ghost"}
                className={`rounded-xl px-4 py-1 ${currentSearchMethod === "CATEGORY" ? "bg-gray-200/20 shadow-md" : "bg-gray-400/0 shadow-none"}`}
                onPress={() => setCurrentSearchMethod("CATEGORY")}
              >
                Categorias
              </Button>
              <Button
                variant={"ghost"}
                className={`rounded-xl bg-blue-500 px-4 py-1 ${currentSearchMethod === "STATEMENT" ? "bg-gray-200/20 shadow-md" : "bg-gray-400/0 shadow-none"}`}
                onPress={() => setCurrentSearchMethod("STATEMENT")}
              >
                Enunciado
              </Button>
            </div>
          </div>
          {currentSearchMethod === "STATEMENT" && (
            <div className="flex flex-col gap-2 overflow-auto">
              <div className={"flex flex-col gap-2"}>
                <label htmlFor={"name"}>Buscar pelo enunciado:</label>
                <Input
                  className="w-full"
                  type="text"
                  name="name"
                  required
                  id={"name"}
                  autoComplete={"none"}
                  value={targetQuestion}
                  onChange={(e) => setTargetQuestion(e.target.value)}
                />
              </div>
              {questionsListState === "LOADING" ?
                <div className="flex justify-center">
                  <LoadingIcon className="h-32 w-32 text-2xl" />
                </div>
              : questionsListState === "LOADED" ?
                <SearchedQuestionList
                  questions={deferredFoundQuestions}
                  formId={formId}
                  initialQuestions={initialQuestions}
                  handleQuestionsToAdd={handleQuestionsToAdd}
                  questionsToAdd={questionsToAdd}
                  questionsToRemove={questionsToRemove}
                />
              : <div className="flex flex-col justify-center">
                  <p className="text-center">Erro ao carregar questões</p>
                  <IconX className="h-32 w-32 text-2xl" />
                </div>
              }
            </div>
          )}

          {currentSearchMethod === "CATEGORY" && (
            <div className="flex flex-col gap-2 overflow-auto">
              <h4>Buscar por categoria: </h4>
              <label htmlFor="category-select">Categoria: </label>
              <Select name="category-select" onChange={handleCategoryChange}>
                {categories.map((category) => {
                  return (
                    <option value={category.id} key={category.id}>
                      {category.name}
                    </option>
                  );
                })}
              </Select>
              <label htmlFor="subcategory-select">Subcategoria: </label>
              <Select
                name="subcategory-select"
                onChange={(e) => handleSubcategoryChange(e.target.value)}
              >
                <option value="ALL">TODAS</option>
                <option value="NULL">NENHUMA</option>

                {categories
                  .find(
                    (category) =>
                      category.id ===
                      selectedCategoryAndSubcategoryId.categoryId,
                  )
                  ?.subcategory.map((subcategory) => {
                    return (
                      <option value={subcategory.id} key={subcategory.id}>
                        {subcategory.name}
                      </option>
                    );
                  })}
              </Select>
              {questionsListState === "LOADING" ?
                <div className="flex justify-center">
                  <LoadingIcon className="h-32 w-32 text-2xl" />
                </div>
              : questionsListState === "LOADED" ?
                <QuestionList
                  questions={foundQuestionsByCategory}
                  formId={formId}
                  initialQuestions={initialQuestions}
                  handleQuestionsToAdd={handleQuestionsToAdd}
                  questionsToAdd={questionsToAdd}
                  questionsToRemove={questionsToRemove}
                />
              : <div className="flex flex-col justify-center">
                  <p className="text-center">Erro ao carregar questões</p>
                  <IconX className="h-32 w-32 text-2xl" />
                </div>
              }
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const SearchedQuestionList = ({
  questions,
  formId,
  initialQuestions,
  handleQuestionsToAdd,
  questionsToAdd,
  questionsToRemove,
}: {
  questions: FormQuestion[];
  formId?: number;
  initialQuestions: Question[] | null;
  handleQuestionsToAdd: (question: FormQuestion) => void;
  questionsToAdd: FormQuestion[];
  questionsToRemove: FormQuestion[];
}) => {
  useEffect(() => {}, [questionsToAdd.length, questionsToRemove.length]);

  const updatedQuestionsToRemove = questionsToRemove.filter((qToRemove) =>
    questionsToAdd.every((qAdded) => qToRemove.id !== qAdded.id),
  );

  const filteredQuestions = questions.filter((question) => {
    const isQuestionInInitial = initialQuestions?.some(
      (q) => q.id === question.id,
    );
    const isQuestionAdded = questionsToAdd.some((q) => q.id === question.id);
    const isQuestionToRemove = updatedQuestionsToRemove.some(
      (q) => q.id === question.id,
    );

    return (!isQuestionInInitial && !isQuestionAdded) || isQuestionToRemove;
  });

  return (
    <div className="w-full text-black">
      {filteredQuestions.map((question) => (
        <QuestionComponent
          key={question.id}
          questionId={question.id}
          characterType={question.characterType}
          name={question.name}
          notes={question.notes}
          type={question.questionType}
          optionType={question.optionType}
          options={question.options}
          formId={formId}
          handleQuestionsToAdd={handleQuestionsToAdd}
          showCategory={true}
          categoryId={question.category.id}
          subcategoryId={question.subcategory?.id}
          categoryName={question.category.name}
          subcategoryName={question.subcategory?.name}
        />
      ))}
    </div>
  );
};

const QuestionList = ({
  questions,
  formId,
  initialQuestions,
  handleQuestionsToAdd,
  questionsToAdd,
  questionsToRemove,
}: {
  questions: FormQuestion[];
  formId?: number;
  initialQuestions: Question[] | null;
  handleQuestionsToAdd: (question: FormQuestion) => void;
  questionsToAdd: FormQuestion[];
  questionsToRemove: FormQuestion[];
}) => {
  useEffect(() => {}, [questionsToAdd.length, questionsToRemove.length]);

  const updatedQuestionsToRemove = questionsToRemove.filter((qToRemove) =>
    questionsToAdd.every((qAdded) => qToRemove.id !== qAdded.id),
  );

  const filteredQuestions = questions.filter((question) => {
    const isQuestionInInitial = initialQuestions?.some(
      (q) => q.id === question.id,
    );
    const isQuestionAdded = questionsToAdd.some((q) => q.id === question.id);
    const isQuestionToRemove = updatedQuestionsToRemove.some(
      (q) => q.id === question.id,
    );

    return (!isQuestionInInitial && !isQuestionAdded) || isQuestionToRemove;
  });

  return (
    <div className="w-full text-black">
      {filteredQuestions.map((question) => (
        <QuestionComponent
          key={question.id}
          questionId={question.id}
          characterType={question.characterType}
          name={question.name}
          notes={question.notes}
          type={question.type}
          optionType={question.optionType}
          options={question.options}
          formId={formId}
          handleQuestionsToAdd={handleQuestionsToAdd}
          showCategory={false}
          categoryId={question.category.id}
          subcategoryId={question.subcategory?.id}
          categoryName={question.category.name}
          subcategoryName={question.subcategory?.name}
        />
      ))}
    </div>
  );
};

const QuestionComponent = ({
  questionId,
  characterType,
  handleQuestionsToAdd,
  name,
  notes,
  type,
  optionType,
  options,
  showCategory,
  categoryId,
  subcategoryId,
  categoryName,
  subcategoryName,
}: {
  questionId: number;
  characterType: QuestionResponseCharacterTypes;
  handleQuestionsToAdd: (question: FormQuestion) => void;
  name: string;
  notes: string | null;
  type: QuestionTypes;
  optionType: OptionTypes | null;
  options: { text: string }[];
  formId?: number;
  showCategory: boolean;
  categoryId: number;
  subcategoryId?: number;
  categoryName: string;
  subcategoryName?: string;
}) => {
  return (
    <div
      key={questionId}
      className="mb-2 flex items-center justify-between rounded bg-white p-2"
    >
      {name}
      {showCategory &&
        `, Categoria: ${categoryName}, Subcategoria: ${subcategoryName ? subcategoryName : "NENHUMA"}`}
      <Button
        variant={"constructive"}
        type="submit"
        className={"w-min"}
        onPress={() =>
          handleQuestionsToAdd({
            id: questionId,
            name,
            notes,
            type,
            optionType,
            options,
            category: { id: categoryId, name: categoryName },
            subcategory:
              subcategoryId && subcategoryName ?
                { id: subcategoryId, name: subcategoryName, categoryId }
              : null,
            characterType: characterType,
          })
        }
      >
        <span>
          <IconCirclePlus />
        </span>
      </Button>
    </div>
  );
};

export { QuestionForm, QuestionList };
