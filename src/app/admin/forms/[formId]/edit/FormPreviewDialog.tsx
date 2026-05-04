"use client";

import CLinearProgress from "@/components/ui/CLinearProgress";
import CDialog from "@/components/ui/dialog/cDialog";
import type { FormValues } from "@/components/ui/responseForm/responseFormTypes";
import type {
  AssessmentCategoryItem,
  AssessmentQuestionItem,
  AssessmentSubcategoryItem,
} from "@/lib/serverFunctions/queries/assessment";
import { FormItemUtils } from "@/lib/utils/formTreeUtils";
import { OptionTypes, QuestionResponseCharacterTypes } from "@prisma/client";
import dynamic from "next/dynamic";
import { useMemo } from "react";

import type { CalculationParams } from "./calculations/calculationDialog";
import type {
  CategoryItem,
  FormEditorTree,
  QuestionItem,
  SubcategoryItem,
} from "./clientV2";

const ResponseFormV2 = dynamic(
  () => import("@/app/admin/assessments/[selectedAssessmentId]/responseFormV2"),
  {
    ssr: false,
    loading: () => <CLinearProgress label="Carregando prévia..." />,
  },
);

const getInitialQuestionValue = (question: QuestionItem) => {
  if (question.questionType === "OPTIONS") {
    return question.optionType === OptionTypes.CHECKBOX ? [] : null;
  }

  if (question.questionType === "BOOLEAN") {
    return false;
  }

  if (
    question.characterType === QuestionResponseCharacterTypes.NUMBER ||
    question.characterType === QuestionResponseCharacterTypes.PERCENTAGE ||
    question.characterType === QuestionResponseCharacterTypes.SCALE
  ) {
    return null;
  }

  return "";
};

const toAssessmentQuestion = ({
  question,
  calculationExpression,
}: {
  question: QuestionItem;
  calculationExpression?: string;
}): AssessmentQuestionItem => {
  return {
    ...question,
    id: question.questionId,
    scaleConfig: question.scaleConfig,
    options: question.options,
    calculationExpression,
  };
};

const toAssessmentSubcategory = ({
  subcategory,
  calculationByQuestionId,
  responsesFormValues,
}: {
  subcategory: SubcategoryItem;
  calculationByQuestionId: Map<number, CalculationParams>;
  responsesFormValues: FormValues;
}): AssessmentSubcategoryItem => ({
  ...subcategory,
  id: subcategory.subcategoryId,
  questions: subcategory.questions.map((question) => {
    responsesFormValues[String(question.questionId)] =
      getInitialQuestionValue(question);

    return toAssessmentQuestion({
      question,
      calculationExpression: calculationByQuestionId.get(question.questionId)
        ?.expression,
    });
  }),
});

const toAssessmentCategory = ({
  category,
  calculationByQuestionId,
  responsesFormValues,
}: {
  category: CategoryItem;
  calculationByQuestionId: Map<number, CalculationParams>;
  responsesFormValues: FormValues;
}): AssessmentCategoryItem => ({
  ...category,
  id: category.categoryId,
  categoryChildren: category.categoryChildren.map((child) => {
    if (FormItemUtils.isSubcategoryType(child)) {
      return toAssessmentSubcategory({
        subcategory: child,
        calculationByQuestionId,
        responsesFormValues,
      });
    }

    responsesFormValues[String(child.questionId)] =
      getInitialQuestionValue(child);

    return toAssessmentQuestion({
      question: child,
      calculationExpression: calculationByQuestionId.get(child.questionId)
        ?.expression,
    });
  }),
});

const countQuestions = (formTree: FormEditorTree) =>
  formTree.categories.reduce((total, category) => {
    const categoryQuestions = category.categoryChildren.reduce(
      (categoryTotal, child) => {
        if (FormItemUtils.isSubcategoryType(child)) {
          return categoryTotal + child.questions.length;
        }

        return categoryTotal + 1;
      },
      0,
    );

    return total + categoryQuestions;
  }, 0);

const buildPreviewAssessmentTree = ({
  formTree,
  formCalculations,
}: {
  formTree: FormEditorTree;
  formCalculations: CalculationParams[];
}) => {
  const responsesFormValues: FormValues = {};
  const calculationByQuestionId = new Map(
    formCalculations.map((calculation) => [
      calculation.targetQuestionId,
      calculation,
    ]),
  );

  return {
    id: -1,
    startDate: new Date(),
    endDate: null,
    isFinalized: false,
    formName: formTree.name,
    totalQuestions: countQuestions(formTree),
    responsesFormValues,
    geometries: [],
    categories: formTree.categories.map((category) =>
      toAssessmentCategory({
        category,
        calculationByQuestionId,
        responsesFormValues,
      }),
    ),
    driveFolderUrl: null,
  };
};

const FormPreviewDialog = ({
  open,
  onClose,
  formTree,
  formCalculations,
}: {
  open: boolean;
  onClose: () => void;
  formTree: FormEditorTree;
  formCalculations: CalculationParams[];
}) => {
  const assessmentTree = useMemo(
    () => buildPreviewAssessmentTree({ formTree, formCalculations }),
    [formTree, formCalculations],
  );

  return (
    <CDialog
      fullScreen
      disableDialogActions
      title="Prévia do formulário"
      open={open}
      onClose={onClose}
    >
      <div className="w-full">
        <ResponseFormV2
          locationId={-1}
          locationName="Preview"
          locationPolygonGeoJson={null}
          assessmentTree={assessmentTree}
          finalized={false}
          userCanEdit
          isPreview
        />
      </div>
    </CDialog>
  );
};

export default FormPreviewDialog;
