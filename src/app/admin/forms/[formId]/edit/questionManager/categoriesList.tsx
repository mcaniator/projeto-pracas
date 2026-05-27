import CButton from "@/components/ui/cButton";
import CDynamicIcon from "@/components/ui/dynamicIcon/cDynamicIcon";
import CQuestionDescriptionChips from "@/components/ui/question/cQuestionDescriptionChips";
import CAccordion from "@components/ui/accordion/CAccordion";
import CAccordionDetails from "@components/ui/accordion/CAccordionDetails";
import CAccordionSummary from "@components/ui/accordion/CAccordionSummary";
import CNotesChip from "@components/ui/question/cNotesChip";
import {
  CategoryForQuestionPicker,
  OptionForQuestionPicker,
  QuestionForQuestionPicker,
  QuestionPickerQuestionToAdd,
  QuestionPickerQuestionToEdit,
  SubCategoryForQuestionPicker,
} from "@customTypes/forms/formCreation";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  OptionTypes,
  QuestionGeometryTypes,
  QuestionResponseCharacterTypes,
  QuestionTypes,
} from "@prisma/client";
import { IconCirclePlus, IconPencil } from "@tabler/icons-react";

const CategoriesListV2 = ({
  categories,
  showAllQuestions,
  formQuestionsIds,
  disableNoQuestionsLeftMessage,
  addQuestion,
  editQuestion,
}: {
  categories: CategoryForQuestionPicker[];
  formQuestionsIds: number[];
  showAllQuestions: boolean;
  disableNoQuestionsLeftMessage: boolean;
  addQuestion: (question: QuestionPickerQuestionToAdd) => void;
  editQuestion?: (question: QuestionPickerQuestionToEdit) => void;
}) => {
  const searchHasRemainingQuestions = categories.some(
    (cat) =>
      cat.question.some((q) => !formQuestionsIds.includes(q.id)) ||
      cat.subcategory.some((sub) =>
        sub.question.some((q) => !formQuestionsIds.includes(q.id)),
      ),
  );
  if (
    !disableNoQuestionsLeftMessage &&
    !searchHasRemainingQuestions &&
    !showAllQuestions
  ) {
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
          showAllQuestions ||
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
                      showAllQuestions={showAllQuestions}
                      categoryName={cat.name}
                      addQuestion={addQuestion}
                      editQuestion={editQuestion}
                    />
                  )}
                  {((showAllQuestions && cat.question.length > 0) ||
                    cat.question.some(
                      (q) => !formQuestionsIds.includes(q.id),
                    )) && (
                    <QuestionListV2
                      questions={cat.question}
                      formQuestionsIds={formQuestionsIds}
                      categoryId={cat.id}
                      showAllQuestions={showAllQuestions}
                      addQuestion={addQuestion}
                      categoryName={cat.name}
                      subcategoryName={null}
                      editQuestion={editQuestion}
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
  showAllQuestions,
  categoryName,
  editQuestion,
  addQuestion,
}: {
  subcategories: SubCategoryForQuestionPicker[];
  formQuestionsIds: number[];
  categoryId: number;
  showAllQuestions: boolean;
  categoryName: string;
  addQuestion: (question: QuestionPickerQuestionToAdd) => void;
  editQuestion?: (question: QuestionPickerQuestionToEdit) => void;
}) => {
  return (
    <div className="p-1">
      {subcategories.map((sub, index) => {
        if (
          (showAllQuestions && sub.question.length > 0) ||
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
                  showAllQuestions={showAllQuestions}
                  categoryName={categoryName}
                  subcategoryName={sub.name}
                  addQuestion={addQuestion}
                  editQuestion={editQuestion}
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
  categoryName,
  subcategoryName,
  subcategoryId,
  showAllQuestions,
  editQuestion,
  addQuestion,
}: {
  questions: QuestionForQuestionPicker[];
  formQuestionsIds: number[];
  categoryId: number;
  subcategoryId?: number | null;
  showAllQuestions: boolean;
  categoryName: string;
  subcategoryName: string | null;
  addQuestion: (question: QuestionPickerQuestionToAdd) => void;
  editQuestion?: (question: QuestionPickerQuestionToEdit) => void;
}) => {
  const filteredQuestions =
    showAllQuestions ? questions : (
      questions.filter((q) => !formQuestionsIds.includes(q.id))
    );

  return (
    <div className="px-1">
      {!showAllQuestions ||
        (filteredQuestions.length === 0 && (
          <p className="my-4 text-center">
            Nenhuma questão restante encontrada!
          </p>
        ))}
      {filteredQuestions.map((question) => (
        <QuestionComponentV2
          key={question.id}
          questionId={question.id}
          characterType={question.characterType}
          name={question.name}
          iconKey={question.iconKey}
          isPublic={question.isPublic}
          notes={question.notes}
          questionType={question.questionType}
          optionType={question.optionType}
          options={question.options}
          scaleConfig={question.scaleConfig}
          allowResponseImages={question.allowResponseImages}
          geometryTypes={question.geometryTypes}
          addQuestion={addQuestion}
          categoryId={categoryId}
          subcategoryId={subcategoryId}
          showAllQuestions={showAllQuestions}
          categoryName={categoryName}
          subcategoryName={subcategoryName}
          isInCurrentForm={formQuestionsIds.includes(question.id)}
          editQuestion={editQuestion}
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
  iconKey,
  isPublic,
  notes,
  questionType,
  optionType,
  options,
  allowResponseImages,
  geometryTypes,
  scaleConfig,
  categoryId,
  subcategoryId,
  showAllQuestions,
  categoryName,
  subcategoryName,
  isInCurrentForm,
  editQuestion,
}: {
  questionId: number;
  characterType: QuestionResponseCharacterTypes;
  addQuestion: (question: QuestionPickerQuestionToAdd) => void;
  name: string;
  iconKey: string;
  isPublic: boolean;
  notes: string | null;
  questionType: QuestionTypes;
  optionType: OptionTypes | null;
  allowResponseImages: boolean;
  geometryTypes: QuestionGeometryTypes[];
  options: OptionForQuestionPicker[];
  scaleConfig: {
    minValue: number;
    maxValue: number;
  } | null;
  categoryId: number;
  categoryName: string;
  subcategoryId?: number | null;
  subcategoryName: string | null;
  showAllQuestions: boolean;
  isInCurrentForm: boolean;
  editQuestion?: (question: QuestionPickerQuestionToEdit) => void;
}) => {
  return (
    <div
      key={questionId}
      className="mb-2 flex flex-col items-center justify-center rounded bg-white p-2 text-black outline outline-1 outline-gray-600 sm:flex-row sm:justify-between"
    >
      <div className="mr-2">
        <CQuestionDescriptionChips
          question={{
            questionType,
            optionType,
            options,
            name,
            characterType,
            geometryTypes,
            isPublic,
            allowResponseImages,
            notes,
          }}
        />
      </div>
      <div className="flex max-w-full items-center gap-2 break-all">
        <CDynamicIcon iconKey={iconKey} />
        {name}
      </div>
      {showAllQuestions ?
        <CButton
          variant="text"
          disabled={isInCurrentForm}
          tooltip={
            isInCurrentForm ?
              "Remova a questão do formulário para editá-la"
            : undefined
          }
          onClick={() => {
            editQuestion?.({
              id: questionId,
              name,
              iconKey,
              isPublic,
              notes,
              questionType,
              optionType,
              options,
              scaleConfig,
              allowResponseImages,
              geometryTypes,
              categoryId,
              subcategoryId: subcategoryId ?? null,
              characterType,
              categoryName,
              subcategoryName,
            });
          }}
        >
          <IconPencil />
        </CButton>
      : <CButton
          type="submit"
          className={"w-min"}
          onClick={() =>
            addQuestion({
              id: questionId,
              name,
              iconKey,
              isPublic,
              notes,
              questionType,
              optionType,
              options,
              scaleConfig,
              allowResponseImages,
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
      }
    </div>
  );
};

export default CategoriesListV2;
