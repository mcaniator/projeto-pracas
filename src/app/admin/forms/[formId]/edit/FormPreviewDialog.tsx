"use client";

import CLinearProgress from "@/components/ui/CLinearProgress";
import AssessmentResultViewer, {
  type PublicAssessmentCategoryItem,
  type PublicAssessmentQuestionItem,
  type PublicAssessmentSubcategoryItem,
} from "@/components/ui/assessment/assessmentResultViewer";
import CSwitch from "@/components/ui/cSwtich";
import CToggleButtonGroup from "@/components/ui/cToggleButtonGroup";
import CDialog from "@/components/ui/dialog/cDialog";
import type {
  FormValues,
  ResponseFormGeometry,
} from "@/components/ui/responseForm/responseFormTypes";
import type {
  AssessmentCategoryItem,
  AssessmentQuestionItem,
  AssessmentSubcategoryItem,
} from "@/lib/serverFunctions/queries/assessment";
import { Calculation } from "@/lib/utils/calculationUtils";
import { FormItemUtils } from "@/lib/utils/formTreeUtils";
import { OptionTypes, QuestionResponseCharacterTypes } from "@prisma/client";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useState } from "react";

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

type PreviewViewMode = "form" | "result";

const previewViewModes: { label: string; value: PreviewViewMode }[] = [
  { label: "Formulário", value: "form" },
  { label: "Resultado", value: "result" },
];

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
}): PublicAssessmentQuestionItem => {
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
}): PublicAssessmentSubcategoryItem => ({
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
}): PublicAssessmentCategoryItem => ({
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

const isAssessmentSubcategoryItem = (
  item: AssessmentQuestionItem | AssessmentSubcategoryItem,
): item is AssessmentSubcategoryItem => {
  return "questions" in item;
};

const forEachAssessmentQuestion = (
  categories: AssessmentCategoryItem[],
  callback: (question: AssessmentQuestionItem) => void,
) => {
  categories.forEach((category) => {
    category.categoryChildren.forEach((child) => {
      if (isAssessmentSubcategoryItem(child)) {
        child.questions.forEach(callback);
        return;
      }

      callback(child);
    });
  });
};

const buildResultValues = ({
  categories,
  values,
}: {
  categories: AssessmentCategoryItem[];
  values: FormValues;
}) => {
  const resultValues: FormValues = { ...values };
  const numericResponses = new Map<number, number>();

  Object.entries(values).forEach(([questionId, value]) => {
    if (typeof value === "number" && Number.isFinite(value)) {
      numericResponses.set(Number(questionId), value);
    }
  });

  forEachAssessmentQuestion(categories, (question) => {
    if (!question.calculationExpression) {
      return;
    }

    const value = new Calculation(
      question.calculationExpression,
      numericResponses,
    ).evaluate();

    resultValues[String(question.questionId)] = value;

    if (typeof value === "number" && Number.isFinite(value)) {
      numericResponses.set(question.questionId, value);
    }
  });

  return resultValues;
};

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
  const [viewMode, setViewMode] = useState<PreviewViewMode>("form");
  const [showOnlyPublicQuestions, setShowOnlyPublicQuestions] = useState(false);
  const assessmentTree = useMemo(
    () => buildPreviewAssessmentTree({ formTree, formCalculations }),
    [formTree, formCalculations],
  );
  const [previewValues, setPreviewValues] = useState<FormValues>(
    assessmentTree.responsesFormValues,
  );
  const [previewGeometries, setPreviewGeometries] = useState<
    ResponseFormGeometry[]
  >(assessmentTree.geometries);

  useEffect(() => {
    setPreviewValues(assessmentTree.responsesFormValues);
    setPreviewGeometries(assessmentTree.geometries);
    setViewMode("form");
    setShowOnlyPublicQuestions(false);
  }, [assessmentTree]);

  const handleValuesChange = useCallback((values: FormValues) => {
    setPreviewValues({ ...values });
  }, []);

  const handleGeometriesChange = useCallback(
    (geometries: ResponseFormGeometry[]) => {
      setPreviewGeometries(geometries);
    },
    [],
  );

  const resultAssessmentTree = useMemo(
    () => ({
      ...assessmentTree,
      responsesFormValues: buildResultValues({
        categories: assessmentTree.categories,
        values: previewValues,
      }),
      geometries: previewGeometries,
    }),
    [assessmentTree, previewGeometries, previewValues],
  );

  return (
    <CDialog
      fullScreen
      disableDialogActions
      title="Prévia do formulário"
      open={open}
      onClose={onClose}
    >
      <div className="fixed left-1/2 top-16 z-50 -translate-x-1/2">
        <CToggleButtonGroup
          options={previewViewModes}
          value={viewMode}
          getLabel={(option) => option.label}
          getValue={(option) => option.value}
          onChange={(_, option) => {
            setViewMode(option.value);
          }}
        />
      </div>

      <div className={viewMode === "form" ? "w-full pt-16" : "hidden"}>
        <ResponseFormV2
          locationId={-1}
          locationName="Preview"
          locationPolygonGeoJson={null}
          assessmentTree={assessmentTree}
          finalized={false}
          userCanEdit
          isPreview
          onValuesChange={handleValuesChange}
          onGeometriesChange={handleGeometriesChange}
        />
      </div>

      {viewMode === "result" && (
        <div className="flex w-full flex-col gap-2 pt-16">
          <CSwitch
            checked={showOnlyPublicQuestions}
            label="Mostrar apenas questões públicas"
            onChange={(_, checked) => {
              setShowOnlyPublicQuestions(checked);
            }}
          />
          {showOnlyPublicQuestions ?
            <AssessmentResultViewer
              assessment={resultAssessmentTree}
              filterNonPublicQuestions
            />
          : <AssessmentResultViewer assessment={resultAssessmentTree} />}
        </div>
      )}
    </CDialog>
  );
};

export default FormPreviewDialog;
