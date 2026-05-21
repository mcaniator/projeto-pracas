import CCalculationChip from "@/components/ui/question/cCalculationChip";
import CNotesChip from "@/components/ui/question/cNotesChip";
import CQuestionCharacterTypeChip from "@/components/ui/question/cQuestionCharacterChip";
import CQuestionGeometryChip from "@/components/ui/question/cQuestionGeometryChip";
import CQuestionTypeChip from "@/components/ui/question/cQuestionTypeChip";
import CQuestionVisibilityChip from "@/components/ui/question/cQuestionVisibility";
import type { AssessmentQuestionItem } from "@/lib/serverFunctions/queries/assessment";

import type { SimpleMention } from "./responseFormTypes";

const ResponseFormQuestionDescriptors = ({
  question,
  questionsForMention,
}: {
  question: AssessmentQuestionItem;
  questionsForMention: SimpleMention[];
}) => {
  return (
    <div className="flex flex-row items-center gap-1">
      <CQuestionTypeChip
        questionType={question.questionType}
        optionType={question.optionType}
        options={question.options?.map((o) => o.text)}
        name={question.name}
      />
      <CQuestionCharacterTypeChip characterType={question.characterType} />
      <CQuestionGeometryChip geometryTypes={question.geometryTypes} />
      <CQuestionVisibilityChip isPublic={question.isPublic} />
      <CNotesChip notes={question.notes} name={question.name} />
      <CCalculationChip
        name={question.name}
        expression={question.calculationExpression}
        questions={questionsForMention}
      />
    </div>
  );
};

export default ResponseFormQuestionDescriptors;
