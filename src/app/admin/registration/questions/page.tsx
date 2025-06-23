"use client";

import { useCallback, useEffect, useState } from "react";

import PermissionGuard from "../../../../components/auth/permissionGuard";
import { useHelperCard } from "../../../../components/context/helperCardContext";
import { Select } from "../../../../components/ui/select";
import {
  questionOptionTypesFormatter,
  questionResponseCharacterTypesFormatter,
  questionTypesFormatter,
} from "../../../../lib/enumsFormatation";
import {
  FetchedCategories,
  fetchCategories,
} from "../../../../serverActions/categoryUtil";
import { searchQuestionsByCategoryAndSubcategory } from "../../../../serverActions/questionUtil";
import { DisplayQuestion } from "../forms/[formId]/edit/client";
import { CategoryCreationModal } from "./categoryCreationModal";
import { CategoryDeletionModal } from "./categoryDeletionModal";
import { QuestionCreationModal } from "./questionCreationModal";
import { QuestionDeletionModal } from "./questionDeletionModal";
import { SubcategoryCreationModal } from "./subcategoryCreationModal";
import { SubcategoryDeletionModal } from "./subcategoryDeletionModal";
import SubcategorySelect from "./subcategorySelect";

const QuestionsPage = () => {
  const { setHelperCard } = useHelperCard();
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
    verifySubcategoryNullness: true,
  });
  const [questions, setQuestions] = useState<DisplayQuestion[]>([]);
  const handleCategoriesFetch = useCallback(async () => {
    const catObj = await fetchCategories();
    if (catObj.statusCode === 401) {
      setHelperCard({
        show: true,
        helperCardType: "ERROR",
        content: <>Sem permissão para ver categorias!</>,
      });
      return null;
    } else if (catObj.statusCode !== 200) {
      setHelperCard({
        show: true,
        helperCardType: "ERROR",
        content: <>Erro ao obter categorias!</>,
      });
      return null;
    }
    const cat = catObj.categories!;
    return cat;
  }, [setHelperCard]);
  const fetchCategoriesAfterCreation = () => {
    const fetchCategoriesAfterCreation = async () => {
      const cat = await handleCategoriesFetch();
      setCategories(cat);
      if (!cat) return;
      const currentCategory = cat.find(
        (c) => c.id === selectedCategoryAndSubcategoryId.categoryId,
      );
      setSubcategories(currentCategory?.subcategory || []);
      if (!selectedCategoryAndSubcategoryId.categoryId) {
        setSelectedCategoryAndSubcategoryId({
          categoryId: cat[0]?.id,
          subcategoryId: undefined,
          verifySubcategoryNullness:
            cat[0]?.subcategory.length === 0 ? true : false,
        });
      }
    };
    void fetchCategoriesAfterCreation();
  };

  const fetchCategoriesAfterDeletion = () => {
    const fetchCategoriesAfterDeletion = async () => {
      const cat = await handleCategoriesFetch();
      setCategories(cat);
      if (!cat) return;
      setSubcategories(cat[0]?.subcategory || []);
      setSelectedCategoryAndSubcategoryId({
        categoryId: cat[0]?.id,
        subcategoryId: undefined,
        verifySubcategoryNullness:
          cat[0]?.subcategory.length === 0 ? true : false,
      });
    };
    void fetchCategoriesAfterDeletion();
  };

  useEffect(() => {
    const fetchCat = async () => {
      const cat = await handleCategoriesFetch();
      setCategories(cat);
      if (!cat) return;
      setSubcategories(cat[0]?.subcategory || []);
      setSelectedCategoryAndSubcategoryId((prev) => ({
        ...prev,
        categoryId: cat[0]?.id,
        subcategoryId: undefined,
      }));
    };
    void fetchCat();
  }, [handleCategoriesFetch]);
  useEffect(() => {
    const fetchQuestions = async () => {
      if (selectedCategoryAndSubcategoryId) {
        const questions = await searchQuestionsByCategoryAndSubcategory(
          selectedCategoryAndSubcategoryId.categoryId,
          selectedCategoryAndSubcategoryId?.subcategoryId,
          selectedCategoryAndSubcategoryId.verifySubcategoryNullness,
        );
        setQuestions(questions.questions);
      }
    };
    void fetchQuestions();
  }, [selectedCategoryAndSubcategoryId, categories]);
  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSubcategories(
      categories?.find((cat) => cat.id === parseInt(e.target.value))
        ?.subcategory || [],
    );
    setSelectedCategoryAndSubcategoryId({
      categoryId: parseInt(e.target.value),
      subcategoryId: undefined,
      verifySubcategoryNullness:
        (
          categories?.find((cat) => cat.id === parseInt(e.target.value))
            ?.subcategory.length === 0
        ) ?
          true
        : false,
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
  return (
    <div
      className={"flex min-h-0 w-full flex-grow flex-col gap-5 overflow-auto"}
    >
      <div
        className={
          "overflow-x-none flex w-full flex-col gap-3 rounded-3xl bg-gray-300/30 p-3 shadow-md"
        }
      >
        <div className="overflow-x-none flex w-full flex-col gap-2">
          <h4 className={"text-2xl font-semibold sm:text-3xl"}>Categoria</h4>
          <PermissionGuard requiresAnyRoles={["FORM_MANAGER"]}>
            <div className="flex gap-2">
              <CategoryCreationModal
                fetchCategoriesAfterCreation={fetchCategoriesAfterCreation}
              />
              <CategoryDeletionModal
                categoryId={selectedCategoryAndSubcategoryId.categoryId}
                categoryName={
                  categories?.find(
                    (cat) =>
                      cat.id === selectedCategoryAndSubcategoryId.categoryId,
                  )?.name
                }
                fetchCategoriesAfterDeletion={fetchCategoriesAfterDeletion}
              />
            </div>
          </PermissionGuard>

          <Select
            className="max-w-full text-wrap rounded-md p-2 text-black"
            onChange={handleCategoryChange}
            value={selectedCategoryAndSubcategoryId.categoryId}
          >
            {categories?.map((cat) => {
              return (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              );
            })}
          </Select>

          <div className="flex flex-col gap-2 rounded-xl bg-gray-500/35 px-1 py-4 shadow-inner">
            <h4 className="text-xl font-semibold sm:text-2xl">Subcategoria</h4>
            {selectedCategoryAndSubcategoryId.categoryId && (
              <PermissionGuard requiresAnyRoles={["FORM_MANAGER"]}>
                <div className="flex gap-2">
                  <SubcategoryCreationModal
                    categoryId={selectedCategoryAndSubcategoryId.categoryId}
                    categoryName={
                      categories?.find(
                        (cat) =>
                          cat.id ===
                          selectedCategoryAndSubcategoryId.categoryId,
                      )?.name
                    }
                    fetchCategoriesAfterCreation={fetchCategoriesAfterCreation}
                  />
                  {selectedCategoryAndSubcategoryId.subcategoryId && (
                    <SubcategoryDeletionModal
                      subcategoryId={
                        selectedCategoryAndSubcategoryId.subcategoryId
                      }
                      subcategoryName={
                        categories
                          ?.flatMap((category) => category.subcategory)
                          .find(
                            (subcategory) =>
                              subcategory.id ===
                              selectedCategoryAndSubcategoryId.subcategoryId,
                          )?.name
                      }
                      categoryName={
                        categories?.find(
                          (cat) =>
                            cat.id ===
                            selectedCategoryAndSubcategoryId.categoryId,
                        )?.name
                      }
                      fetchCategoriesAfterDeletion={
                        fetchCategoriesAfterDeletion
                      }
                    />
                  )}
                </div>
              </PermissionGuard>
            )}

            <div>
              <SubcategorySelect
                subcategories={subcategories}
                onChange={handleSubcategoryChange}
                activeButton={
                  selectedCategoryAndSubcategoryId.subcategoryId ?
                    selectedCategoryAndSubcategoryId.subcategoryId
                  : selectedCategoryAndSubcategoryId.verifySubcategoryNullness ?
                    "NULL"
                  : "ALL"
                }
              />

              <div className="flex flex-col gap-2 bg-gray-900/50 px-1 py-4">
                <h6 className={"text-xl font-semibold"}>Questões</h6>
                <PermissionGuard requiresAnyRoles={["FORM_MANAGER"]}>
                  <div>
                    <QuestionCreationModal
                      categoryId={selectedCategoryAndSubcategoryId.categoryId}
                      categoryName={
                        categories?.find(
                          (category) =>
                            category.id ===
                            selectedCategoryAndSubcategoryId.categoryId,
                        )?.name
                      }
                      subcategoryId={
                        selectedCategoryAndSubcategoryId.subcategoryId
                      }
                      subcategoryName={
                        categories
                          ?.flatMap((category) => category.subcategory)
                          .find(
                            (subcategory) =>
                              subcategory.id ===
                              selectedCategoryAndSubcategoryId.subcategoryId,
                          )?.name
                      }
                      fetchCategoriesAfterCreation={
                        fetchCategoriesAfterCreation
                      }
                    />
                  </div>
                </PermissionGuard>

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
                      <div className="flex flex-col sm:flex-row">
                        <span className="text-base font-semibold sm:text-2xl">
                          {question.name}
                        </span>
                        <div className="sm:ml-auto">
                          <div>
                            Tipo: {questionTypesFormatter.get(question.type)}
                          </div>
                          <div>
                            {question.optionType &&
                              `Tipo de opções: ${questionOptionTypesFormatter.get(
                                question.optionType,
                              )}`}
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-700">{question.notes}</p>
                      <p>
                        {`Tipo de caracteres: ${questionResponseCharacterTypesFormatter.get(
                          question.characterType,
                        )}`}
                      </p>
                      {question.type === "OPTIONS" && (
                        <>
                          <div>
                            <h6>Opções:</h6>
                            <ul className="list-disc px-6">
                              {question.options.map((option) => {
                                return <li key={option.text}>{option.text}</li>;
                              })}
                            </ul>
                          </div>
                        </>
                      )}
                      <PermissionGuard requiresAnyRoles={["FORM_MANAGER"]}>
                        <div>
                          <QuestionDeletionModal
                            questionId={question.id}
                            questionName={question.name}
                            fetchCategoriesAfterDeletion={
                              fetchCategoriesAfterDeletion
                            }
                          />
                        </div>
                      </PermissionGuard>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionsPage;
