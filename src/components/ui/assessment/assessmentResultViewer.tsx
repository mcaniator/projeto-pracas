"use client";

import CIconChip from "@/components/ui/cIconChip";
import QuestionResponseRenderer from "@/components/ui/assessment/questionResponseRenderer";
import CDialogTrigger from "@/components/ui/dialog/cDialogTrigger";
import CDynamicIcon from "@/components/ui/dynamicIcon/cDynamicIcon";
import {
  AssessmentCategoryItem,
  AssessmentQuestionItem,
  AssessmentSubcategoryItem,
} from "@/lib/serverFunctions/queries/assessment";
import {
  resolveAssessmentQuestionValue,
  type AssessmentTree,
} from "@utils/assessmentResultViewer/assessmentResultViewerUtils";
import { Divider } from "@mui/material";
import { IconInfoCircle } from "@tabler/icons-react";
import { useMemo } from "react";

const CAssessmentResultViewer = ({
  assessment,
}: {
  assessment: AssessmentTree;
}) => {
  return (
    <div className="flex flex-col gap-1">
      {assessment.categories.map((category, index, arr) => {
        const isLastItem = index === arr.length - 1;
        return (
          <div key={category.id} className="flex flex-col gap-2">
            <Category assessment={assessment} category={category} />
            {!isLastItem && <Divider />}
          </div>
        );
      })}
    </div>
  );
};

const isAssessmentSubcategoryItem = (
  item: AssessmentQuestionItem | AssessmentSubcategoryItem,
): item is AssessmentSubcategoryItem => {
  return "questions" in item;
};

const QuestionValues = ({
  assessment,
  question,
}: {
  assessment: AssessmentTree;
  question: AssessmentQuestionItem;
}) => {
  const resolvedValue = resolveAssessmentQuestionValue(assessment, question);

  return (
    <QuestionResponseRenderer
      question={question}
      resolvedValue={resolvedValue}
    />
  );
};

const QuestionList = ({
  assessment,
  questions,
}: {
  assessment: AssessmentTree;
  questions: AssessmentQuestionItem[];
}) => {
  return (
    <div className="flex flex-wrap gap-4">
      {questions.map((question) => (
        <QuestionValues
          key={question.id}
          assessment={assessment}
          question={question}
        />
      ))}
    </div>
  );
};

const Subcategory = ({
  assessment,
  subcategory,
}: {
  assessment: AssessmentTree;
  subcategory: AssessmentSubcategoryItem;
}) => {
  return (
    <div className="flex flex-col gap-2 p-1 outline-dashed outline-1 outline-gray-300">
      <h5 className="font-medium">{subcategory.name}</h5>
      <QuestionList assessment={assessment} questions={subcategory.questions} />
    </div>
  );
};

const Category = ({
  assessment,
  category,
}: {
  assessment: AssessmentTree;
  category: AssessmentCategoryItem;
}) => {
  const categoryIcons = useMemo(() => {
    const icons: { questionName: string; iconKey: string }[] = [];
    category.categoryChildren.forEach((child) => {
      if (isAssessmentSubcategoryItem(child)) {
        child.questions.forEach((question) => {
          icons.push({
            questionName: question.name,
            iconKey: question.iconKey,
          });
        });
      } else {
        icons.push({
          questionName: child.name,
          iconKey: child.iconKey,
        });
      }
    });
    return icons;
  }, [category.categoryChildren]);
  return (
    <div className="flex flex-col gap-2 pl-px">
      <div className="flex items-center gap-2">
        <h4 className="font-semibold">{category.name}</h4>
        <span>
          <IconsLegendDialog categoryIcons={categoryIcons} />
        </span>
      </div>

      <div className="flex flex-wrap gap-4">
        {category.categoryChildren.map((child) =>
          isAssessmentSubcategoryItem(child) ?
            <div className="w-full" key={child.id}>
              <Subcategory assessment={assessment} subcategory={child} />
            </div>
          : <QuestionValues
              key={child.id}
              assessment={assessment}
              question={child}
            />,
        )}
      </div>
    </div>
  );
};

const IconsLegendDialog = ({
  categoryIcons,
}: {
  categoryIcons: {
    questionName: string;
    iconKey: string;
  }[];
}) => {
  return (
    <CDialogTrigger
      title="Legenda"
      triggerProps={{ square: true, variant: "outlined" }}
      triggerchildren={<IconInfoCircle />}
    >
      {categoryIcons.map((icon, index) => (
        <div key={index} className="my-1 flex items-center">
          <CIconChip
            icon={<CDynamicIcon iconKey={icon.iconKey} />}
            variant="emphasis"
            tooltip={icon.questionName}
          />
          <span>{icon.questionName}</span>
        </div>
      ))}
    </CDialogTrigger>
  );
};

export default CAssessmentResultViewer;
