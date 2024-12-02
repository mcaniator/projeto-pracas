"use client";

import { useEffect, useState } from "react";

import { Button } from "../../../../components/button";
import { Select } from "../../../../components/ui/select";
import {
  FetchedCategories,
  fetchCategories,
} from "../../../../serverActions/categoryUtil";
import { searchQuestionsByCategoryAndSubcategory } from "../../../../serverActions/questionUtil";
import { DisplayQuestion } from "../../forms/[formId]/edit/client";

const QuestionsPage = () => {
  const [categories, setCategories] = useState<FetchedCategories>([]);
  const [subcategories, setSubcategories] = useState<
    {
      id: number;
      name: string;
      optional: boolean;
      active: boolean;
      categoryId: number;
    }[]
  >([]);
  const [
    selectedCategoryAndSubcategoryId,
    setSelectedCategoryAndSubcategoryId,
  ] = useState<{
    categoryId: number | undefined;
    subcateogryId: number | undefined;
    verifySubcategoryNullness: boolean;
  }>({
    categoryId: undefined,
    subcateogryId: undefined,
    verifySubcategoryNullness: true,
  });
  const [questions, setQuestions] = useState<DisplayQuestion[]>([]);
  useEffect(() => {
    const fetchCat = async () => {
      const cat = await fetchCategories();
      setCategories(cat);
      setSubcategories(cat[0]?.subcategory || []);
    };
    void fetchCat();
  }, []);
  useEffect(() => {
    const fetchQuestions = async () => {
      if (selectedCategoryAndSubcategoryId) {
        const questions = await searchQuestionsByCategoryAndSubcategory(
          selectedCategoryAndSubcategoryId.categoryId,
          selectedCategoryAndSubcategoryId?.subcateogryId,
          selectedCategoryAndSubcategoryId.verifySubcategoryNullness,
        );
        setQuestions(questions);
      }
    };
    void fetchQuestions();
  }, [selectedCategoryAndSubcategoryId]);
  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSubcategories(
      categories.find((cat) => cat.id === parseInt(e.target.value))
        ?.subcategory || [],
    );
    setSelectedCategoryAndSubcategoryId({
      categoryId: parseInt(e.target.value),
      subcateogryId: undefined,
      verifySubcategoryNullness: true,
    });
  };
  const handleSubcategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const subcategory =
      e.target.value === "NULL" || e.target.value === "ALL" ?
        undefined
      : parseInt(e.target.value);
    setSelectedCategoryAndSubcategoryId({
      ...selectedCategoryAndSubcategoryId,
      subcateogryId: subcategory,
      verifySubcategoryNullness: e.target.value === "ALL" ? false : true,
    });
  };
  return (
    <div
      className={
        "flex min-h-0 flex-grow flex-col gap-5 overflow-auto p-5 text-white"
      }
    >
      <div
        className={
          "flex h-full flex-col gap-3 overflow-auto rounded-3xl bg-gray-300/30 p-3 shadow-md"
        }
      >
        <h3 className={"text-2xl font-semibold"}>Cadastro</h3>
        <div className="flex w-fit flex-col gap-2 xl:flex-row">
          <Button>Criar categoria</Button>
          <Button>Criar subcategoria</Button>
          <Button>Criar questão</Button>
        </div>

        <h3 className={"text-2xl font-semibold"}>Visualizar questões</h3>
        <div className="flex flex-col gap-1">
          <h4 className={"text-xl font-semibold"}>Selecionar Categoria</h4>
          <Select onChange={handleCategoryChange}>
            {categories.map((cat) => {
              return (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              );
            })}
          </Select>
          <h5>Selecionar subcategoria</h5>
          <Select onChange={handleSubcategoryChange}>
            {subcategories.map((sub) => {
              return (
                <option key={sub.id} value={sub.id}>
                  {sub.name}
                </option>
              );
            })}
            {subcategories.length > 0 && <option value="ALL">TODAS</option>}
            <option value="NULL">NENHUMA</option>
          </Select>
        </div>

        <div className="rounded-xl bg-gray-400/30 p-3 shadow-inner">
          <h6 className={"text-xl font-semibold"}>Questões</h6>
          {questions.length === 0 && (
            <h6 className={"text-md font-semibold"}>
              Nenhuma questão encontrada!
            </h6>
          )}
          {questions.map((question) => {
            return (
              <div
                key={question.id}
                className="mb-2 flex flex-col rounded bg-white p-2 text-black"
              >
                <div className="flex">
                  <span>{question.name}</span>
                  <span className="ml-auto">{question.type}</span>
                </div>
                <p className="text-gray-700">{question.notes}</p>
                <p>{question.characterType}</p>
                {question.type === "OPTIONS" && (
                  <div>
                    <h6>Opções:</h6>
                    <ul className="list-disc px-6">
                      {question.options.map((option) => {
                        return <li key={option.text}>{option.text}</li>;
                      })}
                    </ul>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default QuestionsPage;
