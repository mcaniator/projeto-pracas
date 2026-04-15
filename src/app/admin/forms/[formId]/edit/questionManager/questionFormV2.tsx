"use client";

import { useFetchQuestionsByCategoryAndSubcategory } from "@apiCalls/question";
import CTextField from "@components/ui/cTextField";
import CToggleButtonGroup from "@components/ui/cToggleButtonGroup";
import { useHelperCard } from "@context/helperCardContext";
import {
  CategoryForQuestionPicker,
  QuestionPickerQuestionToAdd,
} from "@customTypes/forms/formCreation";
import { CircularProgress, Divider } from "@mui/material";
import { CategoriesWithQuestions } from "@queries/category";
import { IconX } from "@tabler/icons-react";
import { useCallback, useEffect, useState } from "react";

import CategoriesListV2 from "./categoriesList";
import FormItemManager from "./formItemManager";
import QuestionEditDialog from "./questionEditDialog";
import SearchQuestionByCategoryAndSubcategory from "./searchQuestionByCategoryAndSubcategory";

const QuestionFormV2 = ({
  categories,
  formQuestionsIds,
  showTitle,
  isLoadingCategories,
  formCategoriesAndSubcategoriesIds,
  addQuestion,
  reloadCategories,
}: {
  categories: CategoriesWithQuestions;
  formQuestionsIds: number[];
  showTitle: boolean;
  isLoadingCategories: boolean;
  formCategoriesAndSubcategoriesIds: {
    categoriesIds: number[];
    subcategoriesIds: number[];
  };
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

  const [showAllQuestions, setShowAllQuestions] = useState(
    currentSearchMethod !== 2,
  );

  const [
    selectedCategoryAndSubcategoryId,
    setSelectedCategoryAndSubcategoryId,
  ] = useState<{
    categoryId: number | undefined;
    subcategoryId: number | null;
    verifySubcategoryNullness: boolean;
  }>({
    categoryId: undefined,
    subcategoryId: 0,
    verifySubcategoryNullness: false,
  });

  const [questionToEdit, setQuestionToEdit] = useState<{
    questionId: number;
    questionName: string;
    iconKey: string;
    isPublic: boolean;
    notes: string | null;
    categoryName: string;
    subcategoryName: string | null;
  } | null>(null);

  const [fetchQuestionsByCategoryAndSubcategory, loadingQuestions] =
    useFetchQuestionsByCategoryAndSubcategory({
      callbacks: {
        onSuccess(response) {
          setQuestionsListState("LOADED");
          setCategoriesList(response.data?.categories ?? []);
        },
        onError() {
          setQuestionsListState("ERROR");
          setCategoriesList([]);
        },
      },
    });

  const searchByName = useCallback(async () => {
    if (!searchedName || searchedName.length === 0) {
      setHelperCard({
        show: true,
        helperCardType: "ERROR",
        content: <>Digite um nome para fazer a pesquisa!</>,
      });
      return;
    }
    await fetchQuestionsByCategoryAndSubcategory({ name: searchedName });
  }, [searchedName, fetchQuestionsByCategoryAndSubcategory, setHelperCard]);

  const searchByCategoryAndSubcateogory = useCallback(async () => {
    if (isLoadingCategories || !selectedCategoryAndSubcategoryId.categoryId)
      return;

    await fetchQuestionsByCategoryAndSubcategory({
      categoryId: selectedCategoryAndSubcategoryId.categoryId,
      subcategoryId: selectedCategoryAndSubcategoryId.subcategoryId,
      verifySubcategoryNullness:
        selectedCategoryAndSubcategoryId.verifySubcategoryNullness,
    });
  }, [
    selectedCategoryAndSubcategoryId,
    isLoadingCategories,
    fetchQuestionsByCategoryAndSubcategory,
  ]);

  const searchQuestions = useCallback(() => {
    setCategoriesList([]);
    if (!selectedCategoryAndSubcategoryId.categoryId) {
      setQuestionsListState("LOADED");
    }
    if (currentSearchMethod === 1) {
      setShowAllQuestions(false);
    } else if (currentSearchMethod === 0) {
      setShowAllQuestions(false);
      void searchByCategoryAndSubcateogory();
    } else if (currentSearchMethod === 2) {
      /*setSelectedCategoryAndSubcategoryId((prev) => ({
        ...prev,
        verifySubcategoryNullness: true,
      }));*/
      void searchByCategoryAndSubcateogory();
      setShowAllQuestions(true);
    }
  }, [currentSearchMethod]);

  const handleOpenQuestionEdit = ({
    questionId,
    questionName,
    iconKey,
    isPublic,
    notes,
    categoryName,
    subcategoryName,
  }: {
    questionId: number;
    questionName: string;
    iconKey: string;
    isPublic: boolean;
    notes: string | null;
    categoryName: string;
    subcategoryName: string | null;
  }) => {
    setQuestionToEdit({
      questionId,
      questionName,
      iconKey,
      isPublic,
      notes,
      categoryName,
      subcategoryName,
    });
  };

  useEffect(() => {
    void searchByCategoryAndSubcateogory();
  }, [
    selectedCategoryAndSubcategoryId,
    setHelperCard,
    searchByCategoryAndSubcateogory,
  ]);

  useEffect(() => {
    if (
      categories.length > 0 &&
      selectedCategoryAndSubcategoryId.categoryId === undefined
    )
      setSelectedCategoryAndSubcategoryId({
        categoryId: categories[0]?.id,
        subcategoryId: 0,
        verifySubcategoryNullness: false,
      });
  }, [categories]);

  useEffect(() => {
    searchQuestions();
  }, [searchQuestions]);

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
          { id: 2, label: "Cadastro" },
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
            onSearch={() => {
              void searchByName();
            }}
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
        <>
          <FormItemManager
            categories={categories}
            selectedCategoryAndSubcategoryId={selectedCategoryAndSubcategoryId}
            formCategoriesAndSubcategoriesIds={
              formCategoriesAndSubcategoriesIds
            }
            reloadCategories={reloadCategories}
            setSelectedCategoryAndSubcategoryId={
              setSelectedCategoryAndSubcategoryId
            }
          />
          <Divider />
          <h4>Questões já existentes:</h4>
        </>
      )}
      {loadingQuestions || isLoadingCategories ?
        <div className="m-2 flex justify-center">
          <CircularProgress />
        </div>
      : questionsListState === "LOADED" ?
        <div className="flex flex-col">
          <CategoriesListV2
            categories={categoriesList}
            formQuestionsIds={formQuestionsIds}
            showAllQuestions={showAllQuestions}
            addQuestion={addQuestion}
            editQuestion={(val) => {
              handleOpenQuestionEdit(val);
            }}
          />
        </div>
      : <div className="flex flex-col justify-center">
          <p className="text-center">Erro ao carregar questões</p>
          <IconX className="h-32 w-32 text-2xl" />
        </div>
      }
      <QuestionEditDialog
        open={!!questionToEdit}
        questionId={questionToEdit?.questionId ?? -1}
        questionName={questionToEdit?.questionName ?? ""}
        iconKey={questionToEdit?.iconKey ?? ""}
        isPublic={questionToEdit?.isPublic ?? false}
        notes={questionToEdit?.notes ?? null}
        categoryName={questionToEdit?.categoryName ?? ""}
        subcategoryName={questionToEdit?.subcategoryName ?? ""}
        onClose={() => {
          setQuestionToEdit(null);
        }}
        reloadCategories={() => {
          reloadCategories();
          searchQuestions();
        }}
      />
    </div>
  );
};

export default QuestionFormV2;
