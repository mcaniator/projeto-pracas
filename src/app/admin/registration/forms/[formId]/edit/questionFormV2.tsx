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
import { Accordion, AccordionDetails, AccordionSummary } from "@mui/material";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import {
  OptionTypes,
  QuestionGeometryTypes,
  QuestionResponseCharacterTypes,
  QuestionTypes,
} from "@prisma/client";
import { CategoriesWithQuestions } from "@queries/category";
import { IconCirclePlus, IconX } from "@tabler/icons-react";
import { useEffect, useState } from "react";

import CAutocomplete from "../../../../../../components/ui/cAutoComplete";
import CButton from "../../../../../../components/ui/cButton";
import CNotesChip from "../../../../../../components/ui/question/cNotesChip";
import CQuestionCharacterTypeChip from "../../../../../../components/ui/question/cQuestionCharacterChip";
import CQuestionGeometryChip from "../../../../../../components/ui/question/cQuestionGeometryChip";
import CQuestionTypeChip from "../../../../../../components/ui/question/cQuestionTypeChip";

type SearchMethods = "CATEGORY" | "STATEMENT";

const QuestionFormV2 = ({
  categories,
  formQuestionsIds,
  showTitle,
  addQuestion,
}: {
  categories: CategoriesWithQuestions;
  formQuestionsIds: number[];
  showTitle: boolean;
  addQuestion: (question: QuestionPickerQuestionToAdd) => void;
}) => {
  const { setHelperCard } = useHelperCard();
  const [questionsListState, setQuestionsListState] = useState<
    "LOADING" | "LOADED" | "ERROR"
  >("LOADING");
  const [categoriesList, setCategoriesList] = useState<
    CategoryForQuestionPicker[]
  >([]);
  const [currentSearchMethod, setCurrentSearchMethod] =
    useState<SearchMethods>("CATEGORY");

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
    categoryId: categories[0]?.id,
    subcategoryId: -1,
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
  }, [selectedCategoryAndSubcategoryId, setHelperCard]);

  const subcategoriesOptions =
    categories.find(
      (cat) => cat.id === selectedCategoryAndSubcategoryId.categoryId,
    )?.subcategory || [];
  const fullSubcategoriesOptions = [
    { id: -1, name: "TODAS" },
    { id: 0, name: "NENHUMA" },
    ...subcategoriesOptions,
  ];

  return (
    <div className="flex h-full flex-col bg-white px-3 text-black">
      {showTitle && (
        <h3 className="text-2xl font-semibold">Adicionar questões</h3>
      )}

      <ToggleButtonGroup
        value={currentSearchMethod}
        exclusive
        onChange={(e, newVal) => {
          if (newVal && newVal !== currentSearchMethod) {
            setCurrentSearchMethod(newVal as SearchMethods);
          }
        }}
        size="small"
        color="primary"
        sx={{
          padding: "6px 6px",
          bgcolor: "grey.100",
          width: "fit-content",
          boxShadow: "inset 0 0 4px rgba(0,0,0,0.3)",
        }}
      >
        <ToggleButton
          value="CATEGORY"
          sx={{
            bgcolor: "grey.100",
            color: "black",
            border: "none",
            "&.Mui-selected": {
              bgcolor: "primary.main",
              color: "white",
              "&:hover": {
                bgcolor: "primary.main",
              },
            },
            "&:hover": {
              bgcolor: "grey.300",
            },
          }}
        >
          Categorias
        </ToggleButton>
        <ToggleButton
          value="STATEMENT"
          sx={{
            bgcolor: "grey.100",
            color: "black",
            border: "none",
            "&.Mui-selected": {
              bgcolor: "primary.dark",
              color: "white",
              "&:hover": {
                bgcolor: "primary.dark",
              },
            },
            "&:hover": {
              bgcolor: "grey.300",
            },
          }}
        >
          Enunciado
        </ToggleButton>
      </ToggleButtonGroup>
      {currentSearchMethod === "CATEGORY" && (
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
                subcategoryId: -1,
                verifySubcategoryNullness: false,
              });
            }}
          />
          <CAutocomplete
            options={fullSubcategoriesOptions}
            label="Subcategoria"
            className="w-full"
            value={fullSubcategoriesOptions.find(
              (fs) => fs.id === selectedCategoryAndSubcategoryId.subcategoryId,
            )}
            getOptionLabel={(option) => option.name}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            disableClearable
            onChange={(evt, val) => {
              setSelectedCategoryAndSubcategoryId({
                ...selectedCategoryAndSubcategoryId,
                subcategoryId: val.id,
                verifySubcategoryNullness: val.id === -1 ? false : true,
              });
            }}
          />
          {questionsListState === "LOADING" ?
            <div className="flex justify-center">
              <LoadingIcon className="h-32 w-32 text-2xl" />
            </div>
          : questionsListState === "LOADED" ?
            <CategoriesListV2
              categories={categoriesList}
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

const CategoriesListV2 = ({
  categories,
  formQuestionsIds,
  addQuestion,
}: {
  categories: CategoryForQuestionPicker[];
  formQuestionsIds: number[];
  addQuestion: (question: QuestionPickerQuestionToAdd) => void;
}) => {
  return (
    <div className="p-1">
      {categories.map((cat, index) => {
        return (
          <Accordion
            key={index}
            sx={{
              border: 1,
              borderColor: "primary.main",
              borderRadius: 1,
            }}
            defaultExpanded
          >
            <AccordionSummary
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
            </AccordionSummary>
            <AccordionDetails>
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
            </AccordionDetails>
          </Accordion>
        );
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
            <Accordion
              key={index}
              sx={{
                border: 1,
                borderColor: "primary.main",
                borderRadius: 1,
              }}
              defaultExpanded
            >
              <AccordionSummary
                sx={{
                  backgroundColor: "primary.lighter4",
                  "&:hover": {
                    backgroundColor: "primary.lighter3",
                  },
                }}
              >
                <div className="flex items-center gap-1 p-1">
                  {sub.name}
                  <CNotesChip notes={sub.notes} name={sub.name} />
                </div>
              </AccordionSummary>
              <AccordionDetails>
                <QuestionListV2
                  questions={sub.question}
                  formQuestionsIds={formQuestionsIds}
                  categoryId={categoryId}
                  subcategoryId={sub.id}
                  addQuestion={addQuestion}
                />
              </AccordionDetails>
            </Accordion>
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
      className="mb-2 flex items-center justify-between rounded bg-white p-2 text-black outline outline-1 outline-gray-600"
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
      <div>{name}</div>

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
