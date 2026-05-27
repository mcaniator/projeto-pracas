import { QuestionItem } from "@/app/admin/forms/[formId]/edit/clientV2";
import CNotesChip from "@/components/ui/question/cNotesChip";
import CQuestionAllowResponseImagesChip from "@/components/ui/question/cQuestionAllowResponseImagesChip";
import CQuestionCharacterTypeChip from "@/components/ui/question/cQuestionCharacterChip";
import CQuestionGeometryChip from "@/components/ui/question/cQuestionGeometryChip";
import CQuestionTypeChip from "@/components/ui/question/cQuestionTypeChip";
import CQuestionVisibilityChip from "@/components/ui/question/cQuestionVisibility";

type QuestionDescriptionChipsQuestion = Pick<
  QuestionItem,
  | "allowResponseImages"
  | "characterType"
  | "geometryTypes"
  | "isPublic"
  | "name"
  | "notes"
  | "optionType"
  | "options"
  | "questionType"
>;

const CQuestionDescriptionChips = ({
  question,
}: {
  question: QuestionDescriptionChipsQuestion;
}) => {
  return (
    <div className="flex w-fit flex-wrap items-center gap-1">
      <CQuestionTypeChip
        questionType={question.questionType}
        optionType={question.optionType}
        options={question.options?.map((o) => o.text)}
        name={question.name}
      />
      <CQuestionCharacterTypeChip characterType={question.characterType} />
      <CQuestionGeometryChip geometryTypes={question.geometryTypes} />
      <CQuestionVisibilityChip isPublic={question.isPublic} />
      <CQuestionAllowResponseImagesChip
        allowResponseImages={question.allowResponseImages}
      />
      <CNotesChip notes={question.notes} name={question.name} />
    </div>
  );
};

export default CQuestionDescriptionChips;
