"use client";

import { _searchQuestionsByCategoryAndSubcategory } from "@apiCalls/question";
import LoadingIcon from "@components/LoadingIcon";
import CTextField from "@components/ui/cTextField";
import CToggleButtonGroup from "@components/ui/cToggleButtonGroup";
import { useHelperCard } from "@context/helperCardContext";
import {
  CategoryForQuestionPicker,
  QuestionPickerQuestionToAdd,
} from "@customTypes/forms/formCreation";
import { CategoriesWithQuestions } from "@queries/category";
import { IconX } from "@tabler/icons-react";
import { useCallback, useEffect, useState } from "react";

import CategoriesListV2 from "./categoriesList";
import FormItemManager from "./formItemManager";
import SearchQuestionByCategoryAndSubcategory from "./searchQuestionByCategoryAndSubcategory";

const QuestionFormV2 = ({
  categories,
  formQuestionsIds,
  showTitle,
  isLoadingCategories,
  addQuestion,
  reloadCategories,
}: {
  categories: CategoriesWithQuestions;
  formQuestionsIds: number[];
  showTitle: boolean;
  isLoadingCategories: boolean;
  addQuestion: (question: QuestionPickerQuestionToAdd) => void;
  reloadCategories: () => void;
}) => {
  const { setHelperCard } = useHelperCard();
  const [questionsListState, setQuestionsListState] = useState<
    "LOADING" | "LOADED" | "ERROR"
  >("LOADING");
  const [categoriesList, setCategoriesList] = useState<
    CategoryForQuestionPicker[]
  >([]);
  const [currentSearchMethod, setCurrentSearchMethod] = useState(0);

  const [searchedName, setSearchedName] = useState("");

  const [
    selectedCategoryAndSubcategoryId,
    setSelectedCategoryAndSubcategoryId,
  ] = useState<{
    categoryId: number | undefined;
    subcategoryId: number | null;
    verifySubcategoryNullness: boolean;
    categoryName?: string;
    subcategoryName?: string;
    categoryNotes?: string | null;
    subcategoryNotes?: string | null;
  }>({
    categoryId: undefined,
    subcategoryId: -1,
    verifySubcategoryNullness: false,
  });

  const searchByName = useCallback(() => {
    if (!searchedName || searchedName.length === 0) {
      setHelperCard({
        show: true,
        helperCardType: "ERROR",
        content: <>Digite um nome para fazer a pesquisa!</>,
      });
      return;
    }
    setQuestionsListState("LOADING");
    _searchQuestionsByCategoryAndSubcategory({
      name: searchedName,
    })
      .then((categories) => {
        if (categories.statusCode === 200) {
          setQuestionsListState("LOADED");
          setCategoriesList(categories.categories);
        } else {
          if (categories.statusCode === 401) {
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
          setCategoriesList([]);
        }
      })
      .catch(() => {
        setQuestionsListState("ERROR");
      });
  }, [searchedName, setHelperCard]);

  const searchByCategoryAndSubcateogory = useCallback(() => {
    if (
      categories.length === 0 ||
      isLoadingCategories ||
      !selectedCategoryAndSubcategoryId.categoryId
    )
      return;
    setQuestionsListState("LOADING");
    _searchQuestionsByCategoryAndSubcategory({
      categoryId: selectedCategoryAndSubcategoryId.categoryId,
      subcategoryId: selectedCategoryAndSubcategoryId.subcategoryId,
      verifySubcategoryNullness:
        selectedCategoryAndSubcategoryId.verifySubcategoryNullness,
    })
      .then((categories) => {
        if (categories.statusCode === 200) {
          setQuestionsListState("LOADED");
          setCategoriesList(categories.categories);
        } else {
          if (categories.statusCode === 401) {
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
          setCategoriesList([]);
        }
      })
      .catch(() => {
        setQuestionsListState("ERROR");
      });
  }, [
    selectedCategoryAndSubcategoryId,
    categories,
    isLoadingCategories,
    setHelperCard,
  ]);

  useEffect(() => {
    searchByCategoryAndSubcateogory();
  }, [
    selectedCategoryAndSubcategoryId,
    setHelperCard,
    searchByCategoryAndSubcateogory,
  ]);

  useEffect(() => {
    setCategoriesList([]);
    if (currentSearchMethod === 1) {
      searchByName();
    } else if (currentSearchMethod === 0) {
      searchByCategoryAndSubcateogory();
    }
  }, [currentSearchMethod]);

  useEffect(() => {
    if (categories.length > 0)
      setSelectedCategoryAndSubcategoryId({
        categoryId: categories[0]?.id,
        subcategoryId: -1,
        verifySubcategoryNullness: false,
      });
  }, [categories]);

  const subcategoriesOptions =
    categories.find(
      (cat) => cat.id === selectedCategoryAndSubcategoryId.categoryId,
    )?.subcategory || [];

  return (
    <div className="flex flex-col gap-2 overflow-auto bg-white text-black sm:px-3">
      {showTitle && (
        <h3 className="text-2xl font-semibold">Adicionar questões</h3>
      )}
      <CToggleButtonGroup
        options={[
          { id: 0, label: "Categorias" },
          { id: 1, label: "Nome" },
          { id: 2, label: "Criar" },
        ]}
        getLabel={(i) => i.label}
        getValue={(i) => i.id}
        value={currentSearchMethod}
        onChange={(e, newVal) => {
          setCurrentSearchMethod(newVal.id);
        }}
      />

      {currentSearchMethod === 0 && (
        <SearchQuestionByCategoryAndSubcategory
          categories={categories}
          subcategories={subcategoriesOptions}
          selectedCategoryAndSubcategoryId={selectedCategoryAndSubcategoryId}
          setSelectedCategoryAndSubcategoryId={
            setSelectedCategoryAndSubcategoryId
          }
        />
      )}
      {currentSearchMethod === 1 && (
        <div className="mb-2 flex flex-col gap-2 overflow-auto">
          <h4>Buscar por nome: </h4>
          <CTextField
            label="Nome"
            value={searchedName}
            isSearch
            clearable
            onSearch={searchByName}
            onChange={(e) => {
              setSearchedName(e.target.value);
            }}
          />
          {(!searchedName || searchedName.length === 0) && (
            <div>Digite um nome e pressione enter para realizar uma busca</div>
          )}
        </div>
      )}
      {currentSearchMethod == 2 && (
        <FormItemManager
          categories={categories}
          reloadCategories={reloadCategories}
        />
      )}
      {questionsListState === "LOADING" || isLoadingCategories ?
        <div className="m-2 flex justify-center">
          <LoadingIcon className="h-32 w-32 text-2xl" />
        </div>
      : questionsListState === "LOADED" ?
        <div className="flex flex-col">
          <CategoriesListV2
            categories={categoriesList}
            formQuestionsIds={formQuestionsIds}
            addQuestion={addQuestion}
          />
        </div>
      : <div className="flex flex-col justify-center">
          <p className="text-center">Erro ao carregar questões</p>
          <IconX className="h-32 w-32 text-2xl" />
        </div>
      }
    </div>
  );
};

export default QuestionFormV2;
