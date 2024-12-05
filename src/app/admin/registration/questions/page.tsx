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
import { CategoryCreationModal } from "./categoryCreationModal";
import { CategoryDeletionModal } from "./categoryDeletionModal";
import { SubcategoryCreationModal } from "./subcategoryCreationModal";
import { SubcategoryDeletionModal } from "./subcategoryDeletionModal";

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
    subcategoryId: number | undefined;
    verifySubcategoryNullness: boolean;
  }>({
    categoryId: undefined,
    subcategoryId: undefined,
    verifySubcategoryNullness: false,
  });
  const [questions, setQuestions] = useState<DisplayQuestion[]>([]);
  const fetchCategoriesAfterCreation = () => {
    const fetchCategoriesAfterCreation = async () => {
      const cat = await fetchCategories();
      const currentCategory = cat.find(
        (c) => c.id === selectedCategoryAndSubcategoryId.categoryId,
      );
      setCategories(cat);
      setSubcategories(currentCategory?.subcategory || []);
    };
    void fetchCategoriesAfterCreation();
  };

  const fetchCategoriesAfterDeletion = () => {
    const fetchCategoriesAfterDeletion = async () => {
      const cat = await fetchCategories();
      setCategories(cat);
      setSubcategories(cat[0]?.subcategory || []);
      setSelectedCategoryAndSubcategoryId({
        categoryId: cat[0]?.id,
        subcategoryId: undefined,
        verifySubcategoryNullness: false,
      });
    };
    void fetchCategoriesAfterDeletion();
  };

  useEffect(() => {
    const fetchCat = async () => {
      const cat = await fetchCategories();
      setCategories(cat);
      setSubcategories(cat[0]?.subcategory || []);
      setSelectedCategoryAndSubcategoryId((prev) => ({
        ...prev,
        categoryId: cat[0]?.id,
        subcatogoryId: undefined,
      }));
    };
    void fetchCat();
  }, []);
  useEffect(() => {
    const fetchQuestions = async () => {
      if (selectedCategoryAndSubcategoryId) {
        const questions = await searchQuestionsByCategoryAndSubcategory(
          selectedCategoryAndSubcategoryId.categoryId,
          selectedCategoryAndSubcategoryId?.subcategoryId,
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
      subcategoryId: undefined,
      verifySubcategoryNullness: false,
    });
  };
  const handleSubcategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const subcategory =
      e.target.value === "NULL" || e.target.value === "ALL" ?
        undefined
      : parseInt(e.target.value);
    setSelectedCategoryAndSubcategoryId({
      ...selectedCategoryAndSubcategoryId,
      subcategoryId: subcategory,
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
          <Button>Criar questão</Button>
        </div>
        <div className="flex flex-col gap-1">
          <h4 className={"text-2xl font-semibold"}>Categoria</h4>
          <div>
            <CategoryCreationModal
              fetchCategoriesAfterCreation={fetchCategoriesAfterCreation}
            />
          </div>

          <Select
            onChange={handleCategoryChange}
            value={selectedCategoryAndSubcategoryId.categoryId}
          >
            {categories.map((cat) => {
              return (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              );
            })}
          </Select>
          <div>
            <CategoryDeletionModal
              categoryId={selectedCategoryAndSubcategoryId.categoryId}
              categoryName={
                categories.find(
                  (cat) =>
                    cat.id === selectedCategoryAndSubcategoryId.categoryId,
                )?.name
              }
              fetchCategoriesAfterDeletion={fetchCategoriesAfterDeletion}
            />
          </div>

          <h4>Subcategoria</h4>
          {selectedCategoryAndSubcategoryId.categoryId && (
            <div>
              <SubcategoryCreationModal
                categoryId={selectedCategoryAndSubcategoryId.categoryId}
                categoryName={
                  categories.find(
                    (cat) =>
                      cat.id === selectedCategoryAndSubcategoryId.categoryId,
                  )?.name
                }
                fetchCategoriesAfterCreation={fetchCategoriesAfterCreation}
              />
            </div>
          )}

          <Select
            onChange={handleSubcategoryChange}
            value={
              selectedCategoryAndSubcategoryId.subcategoryId ?
                selectedCategoryAndSubcategoryId.subcategoryId
              : selectedCategoryAndSubcategoryId.verifySubcategoryNullness ?
                "NULL"
              : "ALL"
            }
          >
            {subcategories.map((sub) => {
              return (
                <option key={sub.id} value={sub.id}>
                  {sub.name}
                </option>
              );
            })}

            <option value="NULL">NENHUMA</option>
            {subcategories.length > 0 && <option value="ALL">TODAS</option>}
          </Select>
          <div>
            {selectedCategoryAndSubcategoryId.subcategoryId && (
              <SubcategoryDeletionModal
                subcategoryId={selectedCategoryAndSubcategoryId.subcategoryId}
                subcategoryName={
                  categories
                    .flatMap((category) => category.subcategory)
                    .find(
                      (subcategory) =>
                        subcategory.id ===
                        selectedCategoryAndSubcategoryId.subcategoryId,
                    )?.name
                }
                categoryName={
                  categories.find(
                    (cat) =>
                      cat.id === selectedCategoryAndSubcategoryId.categoryId,
                  )?.name
                }
                fetchCategoriesAfterDeletion={fetchCategoriesAfterDeletion}
              />
            )}
          </div>
        </div>

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
                <span className="text-2xl font-semibold">{question.name}</span>
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
  );
};

export default QuestionsPage;
