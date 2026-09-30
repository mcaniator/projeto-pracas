"use client";

import CLinearProgress from "@/components/ui/CLinearProgress";
import { FetchCategoriesWithSubcategoriesReponse } from "@/lib/serverFunctions/queries/category";
import { useFetchQuestionsByCategoryAndSubcategory } from "@apiCalls/question";
import CTextField from "@components/ui/cTextField";
import {
  CategoryForQuestionPicker,
  QuestionPickerQuestionToAdd,
  QuestionPickerQuestionToEdit,
} from "@customTypes/forms/formCreation";
import { Box, CircularProgress, Divider, Tab, Tabs } from "@mui/material";
import type { FormUse } from "@prisma/client";
import { IconX } from "@tabler/icons-react";
import { useCallback, useEffect, useRef, useState } from "react";

import CategoriesListV2 from "./categoriesList";
import FormItemManager from "./formItemManager";
import QuestionCreation from "./questionCreation";
import SearchQuestionByCategoryAndSubcategory from "./searchQuestionByCategoryAndSubcategory";

const SEARCH_METHODS = {
  CATEGORY: 0,
  NAME: 1,
  REGISTER: 2,
};

const SEARCH_METHODS_OPTIONS = [
  { id: SEARCH_METHODS.CATEGORY, label: "Categorias" },
  { id: SEARCH_METHODS.NAME, label: "Nome" },
  { id: SEARCH_METHODS.REGISTER, label: "Cadastro" },
];

const QuestionFormV2 = ({
  formUse,
  categories,
  formQuestionsIds,
  showTitle,
  isLoadingCategories,
  formCategoriesAndSubcategoriesIds,
  addQuestion,
  reloadCategories,
}: {
  formUse: FormUse;
  categories: FetchCategoriesWithSubcategoriesReponse["categories"];
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
  const [questionsListState, setQuestionsListState] = useState<
    "LOADING" | "LOADED" | "ERROR"
  >("LOADING");
  const [categoriesList, setCategoriesList] = useState<
    CategoryForQuestionPicker[]
  >([]);
  const [currentSearchMethod, setCurrentSearchMethod] = useState(0);
  const lastSearchMethod = useRef(0);
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

  const [questionToEdit, setQuestionToEdit] =
    useState<QuestionPickerQuestionToEdit | null>(null);

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

  const searchByName = useCallback(() => {
    if (!searchedName || searchedName.length === 0) {
      setCategoriesList([]);
      return;
    }
    void fetchQuestionsByCategoryAndSubcategory({
      params: { name: searchedName, formUse },
    });
  }, [searchedName, formUse, fetchQuestionsByCategoryAndSubcategory]);

  const searchByCategoryAndSubcateogory = useCallback(() => {
    if (isLoadingCategories || !selectedCategoryAndSubcategoryId.categoryId)
      return;

    void fetchQuestionsByCategoryAndSubcategory({
      params: {
        formUse,
        categoryId: selectedCategoryAndSubcategoryId.categoryId,
        subcategoryId: selectedCategoryAndSubcategoryId.subcategoryId,
        verifySubcategoryNullness:
          selectedCategoryAndSubcategoryId.verifySubcategoryNullness,
      },
    });
  }, [
    selectedCategoryAndSubcategoryId,
    formUse,
    isLoadingCategories,
    fetchQuestionsByCategoryAndSubcategory,
  ]);

  const searchQuestions = useCallback(() => {
    if (!selectedCategoryAndSubcategoryId.categoryId) {
      setQuestionsListState("LOADED");
    }
    if (currentSearchMethod === SEARCH_METHODS.CATEGORY) {
      setShowAllQuestions(false);
    }
    if (currentSearchMethod === SEARCH_METHODS.NAME) {
      setShowAllQuestions(false);
    } else if (currentSearchMethod === SEARCH_METHODS.REGISTER) {
      setShowAllQuestions(true);
    }

    // Fetch questions if needed
    if (lastSearchMethod.current === SEARCH_METHODS.NAME) {
      void searchByCategoryAndSubcateogory();
    } else if (currentSearchMethod === SEARCH_METHODS.NAME) {
      setCategoriesList([]);
    }
  }, [currentSearchMethod]);

  const handleOpenQuestionEdit = (question: QuestionPickerQuestionToEdit) => {
    setQuestionToEdit(question);
  };

  useEffect(() => {
    void searchByCategoryAndSubcateogory();
  }, [selectedCategoryAndSubcategoryId, searchByCategoryAndSubcateogory]);

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

  useEffect(() => {
    void searchByName();
  }, [searchByName]);

  const subcategoriesOptions =
    categories.find(
      (cat) => cat.id === selectedCategoryAndSubcategoryId.categoryId,
    )?.subcategory || [];

  if (isLoadingCategories) {
    return (
      <div className="flex flex-col gap-2 overflow-auto bg-white py-8 text-black sm:px-3">
        <CLinearProgress label="Carregando.." />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 overflow-auto bg-white py-2 text-black sm:px-3">
      {showTitle && (
        <h3 className="text-2xl font-semibold">Adicionar questões</h3>
      )}
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs
          value={currentSearchMethod}
          onChange={(_, value: number) => {
            lastSearchMethod.current = currentSearchMethod;
            setCurrentSearchMethod(value);
          }}
          aria-label="Método de busca de questões"
        >
          {SEARCH_METHODS_OPTIONS.map((option) => (
            <Tab key={option.id} value={option.id} label={option.label} />
          ))}
        </Tabs>
      </Box>

      {currentSearchMethod === SEARCH_METHODS.CATEGORY && (
        <SearchQuestionByCategoryAndSubcategory
          categories={categories}
          subcategories={subcategoriesOptions}
          selectedCategoryAndSubcategoryId={selectedCategoryAndSubcategoryId}
          setSelectedCategoryAndSubcategoryId={
            setSelectedCategoryAndSubcategoryId
          }
        />
      )}
      {currentSearchMethod === SEARCH_METHODS.NAME && (
        <div className="mb-2 flex flex-col gap-2 overflow-auto">
          <h4>Buscar por nome: </h4>
          <CTextField
            label="Nome"
            value={searchedName}
            debounce={500}
            isSearch
            clearable
            onChange={(e) => {
              setSearchedName(e.target.value);
            }}
          />

          <div>Digite um nome para realizar a busca</div>
        </div>
      )}
      {currentSearchMethod == SEARCH_METHODS.REGISTER && (
        <>
          <FormItemManager
            formUse={formUse}
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
            disableNoQuestionsLeftMessage={
              currentSearchMethod === 1 && !searchedName
            }
            showFullyAddedGroups={
              currentSearchMethod === SEARCH_METHODS.CATEGORY
            }
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
      <QuestionCreation
        formUse={formUse}
        open={!!questionToEdit}
        question={questionToEdit}
        categoryId={questionToEdit?.categoryId}
        subcategoryId={questionToEdit?.subcategoryId ?? undefined}
        categoryName={questionToEdit?.categoryName}
        subcategoryName={questionToEdit?.subcategoryName ?? undefined}
        onClose={() => {
          setQuestionToEdit(null);
        }}
        fetchCategoriesAfterCreation={() => {
          reloadCategories();
        }}
      />
    </div>
  );
};

export default QuestionFormV2;
