"use client";

import { _searchQuestionsByCategoryAndSubcategory } from "@apiCalls/question";
import LoadingIcon from "@components/LoadingIcon";
import { Button } from "@components/button";
import { Select } from "@components/ui/select";
import { useHelperCard } from "@context/helperCardContext";
import { FormQuestionWithCategoryAndSubcategory } from "@customTypes/forms/formCreation";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import {
  OptionTypes,
  QuestionResponseCharacterTypes,
  QuestionTypes,
} from "@prisma/client";
import { CategoriesWithQuestions } from "@queries/category";
import { IconCirclePlus, IconX } from "@tabler/icons-react";
import { useEffect, useState } from "react";

type SearchMethods = "CATEGORY" | "STATEMENT";

const QuestionFormV2 = ({
  categories,
  formQuestionsIds,
  addQuestion,
}: {
  categories: CategoriesWithQuestions;
  formQuestionsIds: number[];
  addQuestion: (question: FormQuestionWithCategoryAndSubcategory) => void;
}) => {
  const { setHelperCard } = useHelperCard();
  const [questionsListState, setQuestionsListState] = useState<
    "LOADING" | "LOADED" | "ERROR"
  >("LOADING");
  const [foundQuestionsByCategory, setFoundQuestionsByCategory] = useState<
    FormQuestionWithCategoryAndSubcategory[]
  >([]);
  const [currentSearchMethod, setCurrentSearchMethod] =
    useState<SearchMethods>("CATEGORY");

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
  return (
    <div className="flex h-full flex-col bg-gray-400">
      <h3 className="text-2xl font-semibold">Questões</h3>
      <ToggleButtonGroup
        value={currentSearchMethod}
        exclusive
        onChange={(e, newVal) => {
          if (newVal && newVal !== currentSearchMethod) {
            setCurrentSearchMethod(newVal);
          }
        }}
        size="small"
        color="primary"
      >
        <ToggleButton value="CATEGORY">Categorias</ToggleButton>
        <ToggleButton value="STATEMENT">Enunciado</ToggleButton>
      </ToggleButtonGroup>
      {currentSearchMethod === "CATEGORY" && (
        <div className="flex flex-col gap-2 overflow-auto">
          <h4>Buscar por categoria: </h4>
          <label htmlFor="category-select">Categoria: </label>
          <Select
            name="category-select"
            onChange={(e) => {
              setSelectedCategoryAndSubcategoryId({
                ...selectedCategoryAndSubcategoryId,
                categoryId: Number(e.target.value),
              });
            }}
          >
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
            onChange={(e) => {
              const subcategory =
                e.target.value === "NULL" || e.target.value === "ALL" ?
                  undefined
                : typeof e === "number" ? e
                : parseInt(e.target.value);
              setSelectedCategoryAndSubcategoryId({
                ...selectedCategoryAndSubcategoryId,
                subcategoryId: subcategory,
                verifySubcategoryNullness:
                  e.target.value === "ALL" ? false : true,
              });
            }}
          >
            <option value="ALL">TODAS</option>
            <option value="NULL">NENHUMA</option>

            {categories
              .find(
                (category) =>
                  category.id === selectedCategoryAndSubcategoryId.categoryId,
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
            <QuestionListV2
              questions={foundQuestionsByCategory}
              formQuestionsIds={formQuestionsIds}
              addQuestion={addQuestion}
            />
          : <div className="flex flex-col justify-center">
              <p className="text-center">Erro ao carregar questões</p>
              <IconX className="h-32 w-32 text-2xl" />
            </div>
          }
        </div>
      )}
    </div>
  );
};

const QuestionListV2 = ({
  questions,
  formQuestionsIds,
  addQuestion,
}: {
  questions: FormQuestionWithCategoryAndSubcategory[];
  formQuestionsIds: number[];
  addQuestion: (question: FormQuestionWithCategoryAndSubcategory) => void;
}) => {
  return (
    <>
      {questions
        .filter((q) => !formQuestionsIds.includes(q.id))
        .map((question) => (
          <QuestionComponentV2
            key={question.id}
            questionId={question.id}
            characterType={question.characterType}
            name={question.name}
            notes={question.notes}
            questionType={question.questionType}
            optionType={question.optionType}
            options={question.options}
            addQuestion={addQuestion}
            showCategory={false}
            categoryId={question.category.id}
            subcategoryId={question.subcategory?.id}
            categoryName={question.category.name}
            subcategoryName={question.subcategory?.name}
          />
        ))}
    </>
  );
};

const QuestionComponentV2 = ({
  questionId,
  characterType,
  addQuestion,
  name,
  notes,
  questionType,
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
  addQuestion: (question: FormQuestionWithCategoryAndSubcategory) => void;
  name: string;
  notes: string | null;
  questionType: QuestionTypes;
  optionType: OptionTypes | null;
  options: { text: string }[];
  showCategory: boolean;
  categoryId: number;
  subcategoryId?: number;
  categoryName: string;
  subcategoryName?: string;
}) => {
  return (
    <div
      key={questionId}
      className="mb-2 flex items-center justify-between rounded bg-white p-2 text-black"
    >
      {name}
      {showCategory &&
        `, Categoria: ${categoryName}, Subcategoria: ${subcategoryName ? subcategoryName : "NENHUMA"}`}
      <Button
        variant={"constructive"}
        type="submit"
        className={"w-min"}
        onPress={() =>
          addQuestion({
            id: questionId,
            name,
            notes,
            questionType,
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

export default QuestionFormV2;
