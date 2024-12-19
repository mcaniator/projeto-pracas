"use client";

import { Button } from "@/components/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { CategoriesWithQuestions } from "@/serverActions/categorySubmit";
import {
  searchQuestionsByCategoryAndSubcategory,
  searchQuestionsByStatement,
} from "@/serverActions/questionUtil";
import {
  OptionTypes,
  Question,
  QuestionResponseCharacterTypes,
  QuestionTypes,
} from "@prisma/client";
import { Suspense, use, useDeferredValue, useEffect, useState } from "react";

import { DisplayQuestion } from "./client";

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
  handleQuestionsToAdd: (question: DisplayQuestion) => void;
  questionsToAdd: DisplayQuestion[];
  questionsToRemove: DisplayQuestion[];
  categories: CategoriesWithQuestions;
}) => {
  const [targetQuestion, setTargetQuestion] = useState("");

  const [currentSearchMethod, setCurrentSearchMethod] =
    useState<SearchMethods>("CATEGORY");
  // TODO: corrigir o tipo de setFoundQuestions
  const [foundQuestions, setFoundQuestions] =
    useState<Promise<DisplayQuestion[]>>();
  const [foundQuestionsByCategory, setFoundQuestionsByCategory] =
    useState<Promise<DisplayQuestion[]>>();

  const [
    selectedCategoryAndSubcategoryId,
    setSelectedCategoryAndSubcategoryId,
  ] = useState<{
    categoryId: number | undefined;
    subcategoryId: number | undefined;
    verifySubcategoryNullness: boolean;
  }>({
    categoryId: undefined,
    subcategoryId: undefined,
    verifySubcategoryNullness: true,
  });

  useEffect(() => {
    setFoundQuestions(searchQuestionsByStatement(targetQuestion));
  }, [targetQuestion]);

  useEffect(() => {
    setFoundQuestionsByCategory(
      searchQuestionsByCategoryAndSubcategory(
        selectedCategoryAndSubcategoryId.categoryId,
        selectedCategoryAndSubcategoryId.subcategoryId,
        selectedCategoryAndSubcategoryId.verifySubcategoryNullness,
      ),
    );
  }, [selectedCategoryAndSubcategoryId]);

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
    <div className={"flex h-full flex-grow gap-5 overflow-auto p-5"}>
      <div className="flex basis-full flex-col gap-5 overflow-auto text-white">
        <div
          className={
            "flex flex-col gap-1 overflow-auto rounded-3xl bg-gray-300/30 p-3 shadow-md"
          }
        >
          <h3 className={"text-2xl font-semibold"}>Busca de Perguntas</h3>
          <div>
            <div className="inline-flex w-auto gap-1 rounded-xl bg-gray-400/20 py-1 text-white shadow-inner">
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
                  type="text"
                  name="name"
                  required
                  id={"name"}
                  autoComplete={"none"}
                  value={targetQuestion}
                  onChange={(e) => setTargetQuestion(e.target.value)}
                />
              </div>
              <Suspense>
                <SearchedQuestionList
                  questionPromise={deferredFoundQuestions}
                  formId={formId}
                  initialQuestions={initialQuestions}
                  handleQuestionsToAdd={handleQuestionsToAdd}
                  questionsToAdd={questionsToAdd}
                  questionsToRemove={questionsToRemove}
                />
              </Suspense>
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
              <QuestionList
                questionPromise={foundQuestionsByCategory}
                formId={formId}
                initialQuestions={initialQuestions}
                handleQuestionsToAdd={handleQuestionsToAdd}
                questionsToAdd={questionsToAdd}
                questionsToRemove={questionsToRemove}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const SearchedQuestionList = ({
  questionPromise,
  formId,
  initialQuestions,
  handleQuestionsToAdd,
  questionsToAdd,
  questionsToRemove,
}: {
  questionPromise?: Promise<DisplayQuestion[]>;
  formId?: number;
  initialQuestions: Question[] | null;
  handleQuestionsToAdd: (question: DisplayQuestion) => void;
  questionsToAdd: DisplayQuestion[];
  questionsToRemove: DisplayQuestion[];
}) => {
  useEffect(() => {}, [questionsToAdd.length, questionsToRemove.length]);
  if (questionPromise === undefined) return null;
  const questions = use(questionPromise);

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
  questionPromise,
  formId,
  initialQuestions,
  handleQuestionsToAdd,
  questionsToAdd,
  questionsToRemove,
}: {
  questionPromise?: Promise<DisplayQuestion[]>;
  formId?: number;
  initialQuestions: Question[] | null;
  handleQuestionsToAdd: (question: DisplayQuestion) => void;
  questionsToAdd: DisplayQuestion[];
  questionsToRemove: DisplayQuestion[];
}) => {
  useEffect(() => {}, [questionsToAdd.length, questionsToRemove.length]);
  if (questionPromise === undefined) return null;
  const questions = use(questionPromise);

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
  handleQuestionsToAdd: (question: DisplayQuestion) => void;
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
        variant={"admin"}
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
        <span className={"-mb-1"}>Adicionar</span>
      </Button>
    </div>
  );
};

export { QuestionForm, QuestionList };