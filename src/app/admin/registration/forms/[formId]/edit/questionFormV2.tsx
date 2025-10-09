"use client";

import { _searchQuestionsByCategoryAndSubcategory } from "@apiCalls/question";
import LoadingIcon from "@components/LoadingIcon";
import { useHelperCard } from "@context/helperCardContext";
import {
  CategoryForQuestionPicker,
  QuestionForQuestionPicker,
  QuestionPickerQuestionToAdd,
  SubCategoryForQuestionPicker,
} from "@customTypes/forms/formCreation";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  OptionTypes,
  QuestionGeometryTypes,
  QuestionResponseCharacterTypes,
  QuestionTypes,
} from "@prisma/client";
import { CategoriesWithQuestions } from "@queries/category";
import { IconCirclePlus, IconX } from "@tabler/icons-react";
import { useCallback, useEffect, useState } from "react";

import CAccordion from "../../../../../../components/ui/accordion/CAccordion";
import CAccordionDetails from "../../../../../../components/ui/accordion/CAccordionDetails";
import CAccordionSummary from "../../../../../../components/ui/accordion/CAccordionSummary";
import CAutocomplete from "../../../../../../components/ui/cAutoComplete";
import CButton from "../../../../../../components/ui/cButton";
import CTextField from "../../../../../../components/ui/cTextField";
import CToggleButtonGroup from "../../../../../../components/ui/cToggleButtonGroup";
import CNotesChip from "../../../../../../components/ui/question/cNotesChip";
import CQuestionCharacterTypeChip from "../../../../../../components/ui/question/cQuestionCharacterChip";
import CQuestionGeometryChip from "../../../../../../components/ui/question/cQuestionGeometryChip";
import CQuestionTypeChip from "../../../../../../components/ui/question/cQuestionTypeChip";
import FormItemManager from "./formItemManager";

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
  const fullSubcategoriesOptions = [
    { id: 0, name: "TODAS" },
    { id: -1, name: "NENHUMA" },
    ...subcategoriesOptions,
  ];

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

      {currentSearchMethod === 0 &&
        selectedCategoryAndSubcategoryId.categoryId && (
          <div className="flex flex-col gap-2 overflow-auto">
            <h4>Buscar por categoria: </h4>
            <CAutocomplete
              options={categories}
              label="Categoria"
              className="w-full"
              value={categories.find(
                (cat) => cat.id === selectedCategoryAndSubcategoryId.categoryId,
              )}
              getOptionLabel={(option) => option.name}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              disableClearable
              onChange={(evt, val) => {
                setSelectedCategoryAndSubcategoryId({
                  categoryId: Number(val?.id),
                  subcategoryId: 0,
                  verifySubcategoryNullness: false,
                });
              }}
            />
            <CAutocomplete
              options={fullSubcategoriesOptions}
              label="Subcategoria"
              className="w-full"
              value={fullSubcategoriesOptions.find(
                (fs) =>
                  fs.id === selectedCategoryAndSubcategoryId.subcategoryId,
              )}
              getOptionLabel={(option) => option.name}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              disableClearable
              onChange={(evt, val) => {
                setSelectedCategoryAndSubcategoryId({
                  ...selectedCategoryAndSubcategoryId,
                  subcategoryId: val.id,
                  verifySubcategoryNullness: val.id === -1 ? true : false,
                });
              }}
            />
          </div>
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
        <div className="flex flex-col gap-2 overflow-auto">
          <h4>Criar questão: </h4>
          <div className="text-red-500">
            Atenção: Antes de criar uma questão, certifique-se se já existe uma
            questão que aborde a avaliação desejada.
          </div>
          <div>
            Questões são reutilizáveis entre formulários, para garantir a
            comparação correta entre avaliações.
          </div>
        </div>
      )}
      {currentSearchMethod !== 2 ?
        questionsListState === "LOADING" || isLoadingCategories ?
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

      : <FormItemManager
          categories={categories}
          reloadCategories={reloadCategories}
        />
      }
    </div>
  );
};

const CategoriesListV2 = ({
  categories,
  formQuestionsIds,
  addQuestion,
}: {
  categories: CategoryForQuestionPicker[];
  formQuestionsIds: number[];
  addQuestion: (question: QuestionPickerQuestionToAdd) => void;
}) => {
  const searchHasRemainingQuestions = categories.some(
    (cat) =>
      cat.question.some((q) => !formQuestionsIds.includes(q.id)) ||
      cat.subcategory.some((sub) =>
        sub.question.some((q) => !formQuestionsIds.includes(q.id)),
      ),
  );
  if (!searchHasRemainingQuestions || categories.length === 0) {
    return (
      <div className="p-1">
        <div>
          Não há questões restantes para os parâmetros de busca selecionados!
        </div>
      </div>
    );
  }
  return (
    <div className="p-1">
      {categories.map((cat, index) => {
        const categoryHasRemainingQuestions =
          cat.question.some((q) => !formQuestionsIds.includes(q.id)) ||
          cat.subcategory.some((sub) =>
            sub.question.some((q) => !formQuestionsIds.includes(q.id)),
          );
        if (categoryHasRemainingQuestions) {
          return (
            <CAccordion
              key={index}
              sx={{
                border: 1,
                borderColor: "primary.main",
                borderRadius: 1,
              }}
              defaultExpanded
            >
              <CAccordionSummary
                expandIcon={<ExpandMoreIcon />}
                sx={{
                  backgroundColor: "primary.lighter4",
                  "&:hover": {
                    backgroundColor: "primary.lighter3",
                  },
                }}
                className="max-w-full"
              >
                <div className="flex items-center gap-1 p-1">
                  {cat.name}
                  <CNotesChip notes={cat.notes} name={cat.name} />
                </div>
              </CAccordionSummary>
              <CAccordionDetails>
                <div className="flex flex-col gap-1">
                  {cat.subcategory.length > 0 && (
                    <SubcategoriesListV2
                      subcategories={cat.subcategory}
                      formQuestionsIds={formQuestionsIds}
                      categoryId={cat.id}
                      addQuestion={addQuestion}
                    />
                  )}
                  {cat.question.filter((q) => !formQuestionsIds.includes(q.id))
                    .length > 0 && (
                    <QuestionListV2
                      questions={cat.question}
                      formQuestionsIds={formQuestionsIds}
                      categoryId={cat.id}
                      addQuestion={addQuestion}
                    />
                  )}
                </div>
              </CAccordionDetails>
            </CAccordion>
          );
        }
      })}
    </div>
  );
};

const SubcategoriesListV2 = ({
  subcategories,
  formQuestionsIds,
  categoryId,
  addQuestion,
}: {
  subcategories: SubCategoryForQuestionPicker[];
  formQuestionsIds: number[];
  categoryId: number;
  addQuestion: (question: QuestionPickerQuestionToAdd) => void;
}) => {
  return (
    <div className="p-1">
      {subcategories.map((sub, index) => {
        if (
          sub.question.filter((q) => !formQuestionsIds.includes(q.id)).length >
          0
        ) {
          return (
            <CAccordion
              key={index}
              sx={{
                border: 1,
                borderColor: "primary.main",
                borderRadius: 1,
              }}
              defaultExpanded
            >
              <CAccordionSummary expandIcon={<ExpandMoreIcon />}>
                <div className="flex items-center gap-1 p-1">
                  {sub.name}
                  <CNotesChip notes={sub.notes} name={sub.name} />
                </div>
              </CAccordionSummary>
              <CAccordionDetails>
                <QuestionListV2
                  questions={sub.question}
                  formQuestionsIds={formQuestionsIds}
                  categoryId={categoryId}
                  subcategoryId={sub.id}
                  addQuestion={addQuestion}
                />
              </CAccordionDetails>
            </CAccordion>
          );
        }
      })}
    </div>
  );
};

const QuestionListV2 = ({
  questions,
  formQuestionsIds,
  categoryId,
  subcategoryId,
  addQuestion,
}: {
  questions: QuestionForQuestionPicker[];
  formQuestionsIds: number[];
  categoryId: number;
  subcategoryId?: number | null;
  addQuestion: (question: QuestionPickerQuestionToAdd) => void;
}) => {
  const filteredQuestions = questions.filter(
    (q) => !formQuestionsIds.includes(q.id),
  );
  return (
    <div className="px-1">
      {filteredQuestions.length === 0 && (
        <p className="my-4 text-center">Nenhuma questão restante encontrada!</p>
      )}
      {filteredQuestions.map((question) => (
        <QuestionComponentV2
          key={question.id}
          questionId={question.id}
          characterType={question.characterType}
          name={question.name}
          notes={question.notes}
          questionType={question.questionType}
          optionType={question.optionType}
          options={question.options}
          geometryTypes={question.geometryTypes}
          addQuestion={addQuestion}
          categoryId={categoryId}
          subcategoryId={subcategoryId}
        />
      ))}
    </div>
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
  geometryTypes,
  categoryId,
  subcategoryId,
}: {
  questionId: number;
  characterType: QuestionResponseCharacterTypes;
  addQuestion: (question: QuestionPickerQuestionToAdd) => void;
  name: string;
  notes: string | null;
  questionType: QuestionTypes;
  optionType: OptionTypes | null;
  geometryTypes: QuestionGeometryTypes[];
  options: { text: string }[];
  categoryId: number;
  subcategoryId?: number | null;
}) => {
  return (
    <div
      key={questionId}
      className="mb-2 flex flex-col items-center justify-center rounded bg-white p-2 text-black outline outline-1 outline-gray-600 sm:flex-row sm:justify-between"
    >
      <div className="mr-2 flex flex-wrap gap-1">
        <CQuestionTypeChip
          questionType={questionType}
          optionType={optionType}
          options={options.map((o) => o.text)}
          name={name}
        />
        <CQuestionCharacterTypeChip characterType={characterType} />
        <CQuestionGeometryChip geometryTypes={geometryTypes} />
        <CNotesChip notes={notes} name={name} />
      </div>
      <div className="max-w-full break-all">{name}</div>

      <CButton
        type="submit"
        className={"w-min"}
        onClick={() =>
          addQuestion({
            id: questionId,
            name,
            notes,
            questionType,
            optionType,
            options,
            geometryTypes,
            categoryId,
            subcategoryId: subcategoryId ?? null,
            characterType: characterType,
          })
        }
      >
        <span>
          <IconCirclePlus />
        </span>
      </CButton>
    </div>
  );
};

export default QuestionFormV2;
