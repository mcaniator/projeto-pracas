"use client";

import { _searchQuestionsByCategoryAndSubcategory } from "@apiCalls/question";
import LoadingIcon from "@components/LoadingIcon";
import { Button } from "@components/button";
import { Select } from "@components/ui/select";
import { useHelperCard } from "@context/helperCardContext";
import { FormQuestionWithCategoryAndSubcategory } from "@customTypes/forms/formCreation";
import Chip from "@mui/material/Chip";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import {
  OptionTypes,
  QuestionGeometryTypes,
  QuestionResponseCharacterTypes,
  QuestionTypes,
} from "@prisma/client";
import { CategoriesWithQuestions } from "@queries/category";
import { IconCirclePlus, IconKeyboard, IconX } from "@tabler/icons-react";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { IoMdCheckbox, IoMdRadioButtonOn } from "react-icons/io";

import CustomModal from "../../../../../../components/modal/customModal";
import CQuestionCharacterTypeChip from "../../../../../../components/ui/question/cQuestionCharacterChip";
import CQuestionGeometryChip from "../../../../../../components/ui/question/cQuestionGeometryChip";
import CQuestionTypeChip from "../../../../../../components/ui/question/cQuestionTypeChip";

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
    <div className="flex h-full flex-col bg-white px-3 text-black">
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
  const [showQuestionOptionsDialog, setShowQuestionOptionsDialog] =
    useState(false);
  const [questionOptions, setQuestionOptions] = useState<{
    questionName: string;
    options: string[];
    optionType: OptionTypes;
  }>({ questionName: "", options: [], optionType: "RADIO" });
  return (
    <div className="px-1">
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
            geometryTypes={question.geometryTypes}
            addQuestion={addQuestion}
            showCategory={false}
            categoryId={question.category.id}
            subcategoryId={question.subcategory?.id}
            categoryName={question.category.name}
            subcategoryName={question.subcategory?.name}
            setQuestionOptions={setQuestionOptions}
            setShowQuestionOptionsDialog={setShowQuestionOptionsDialog}
          />
        ))}
      <CustomModal
        title="Questão de múltipla escolha"
        subtitle={questionOptions.questionName}
        isOpen={showQuestionOptionsDialog}
        onOpenChange={(e) => {
          setShowQuestionOptionsDialog(e);
        }}
        disableModalActions
      >
        <>
          <div>Botão radial (apenas uma opção é permitida)</div>
          <ul className="list-disc px-6 py-3">
            {questionOptions.options.map((o, index) => (
              <li key={index}>{o}</li>
            ))}
          </ul>
        </>
      </CustomModal>
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
  showCategory,
  categoryId,
  subcategoryId,
  categoryName,
  subcategoryName,
  setQuestionOptions,
  setShowQuestionOptionsDialog,
}: {
  questionId: number;
  characterType: QuestionResponseCharacterTypes;
  addQuestion: (question: FormQuestionWithCategoryAndSubcategory) => void;
  name: string;
  notes: string | null;
  questionType: QuestionTypes;
  optionType: OptionTypes | null;
  geometryTypes: [QuestionGeometryTypes];
  options: { text: string }[];
  showCategory: boolean;
  categoryId: number;
  subcategoryId?: number;
  categoryName: string;
  subcategoryName?: string;
  setQuestionOptions: Dispatch<
    SetStateAction<{
      questionName: string;
      options: string[];
      optionType: OptionTypes;
    }>
  >;
  setShowQuestionOptionsDialog: Dispatch<SetStateAction<boolean>>;
}) => {
  return (
    <div
      key={questionId}
      className="mb-2 flex items-center justify-between rounded bg-white p-2 text-black outline outline-1 outline-gray-600"
    >
      <div className="flex gap-1" style={{ width: "120px" }}>
        <CQuestionTypeChip
          questionType={questionType}
          optionType={optionType}
          sx={
            questionType === "OPTIONS" ?
              {
                color: "blue",
                "&:hover": {
                  cursor: "pointer",
                  backgroundColor: "#9090ff",
                },
              }
            : undefined
          }
          onClick={() => {
            if (!optionType || questionType !== "OPTIONS") {
              return;
            }
            setQuestionOptions({
              questionName: name,
              optionType: optionType,
              options: options.map((o) => o.text),
            });
            setShowQuestionOptionsDialog(true);
          }}
        />
        <CQuestionCharacterTypeChip characterType={characterType} />
        <CQuestionGeometryChip geometryTypes={geometryTypes} />
      </div>
      <div className="truncate">{name}</div>

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
            geometryTypes,
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
