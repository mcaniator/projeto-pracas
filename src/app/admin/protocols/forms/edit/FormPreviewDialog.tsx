"use client";

import CLinearProgress from "@/components/ui/CLinearProgress";
import CSwitch from "@/components/ui/cSwtich";
import CToggleButtonGroup from "@/components/ui/cToggleButtonGroup";
import CDialog from "@/components/ui/dialog/cDialog";
import FormSubmissionViewer from "@/components/ui/formSubmissionViewer/formSubmissionViewer";
import type { ResponseFormValuesChange } from "@/components/ui/responseForm/responseFormV2";
import type {
  FormSubmissionCategoryItem,
  FormSubmissionQuestionItem,
  FormSubmissionSubcategoryItem,
  GetFormSubmissionDataResult,
} from "@/lib/serverFunctions/queries/formSubmission";
import type {
  FormValues,
  ResponseFormGeometry,
  ResponseFormImages,
  SerializedFormValues,
} from "@/lib/types/formSubmission/responseFormTypes";
import type {
  CategoryItem,
  FormStructure,
  QuestionItem,
  SubcategoryItem,
} from "@/lib/types/forms/formStructure";
import { FormItemUtils } from "@/lib/utils/formTreeUtils";
import { OptionTypes, QuestionResponseCharacterTypes } from "@prisma/client";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useState } from "react";

const ResponseFormV2 = dynamic(
  () => import("@/components/ui/responseForm/responseFormV2"),
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

const getInitialQuestionValue = (
  question: QuestionItem,
): SerializedFormValues[string] => {
  if (question.questionType === "OPTIONS") {
    return question.optionType === OptionTypes.CHECKBOX ? [] : null;
  }
  if (question.questionType === "BOOLEAN") return false;
  if (
    question.characterType === QuestionResponseCharacterTypes.NUMBER ||
    question.characterType === QuestionResponseCharacterTypes.PERCENTAGE ||
    question.characterType === QuestionResponseCharacterTypes.SCALE
  ) {
    return null;
  }
  return "";
};

const toFormSubmissionQuestion = (
  question: QuestionItem,
): FormSubmissionQuestionItem => ({
  ...question,
  id: question.questionId,
  options: question.options?.map((option) => ({
    id: option.id,
    text: option.text,
    isOverridable: option.isOverridable ?? false,
  })),
});

const toFormSubmissionSubcategory = ({
  subcategory,
  responsesFormValues,
}: {
  subcategory: SubcategoryItem;
  responsesFormValues: SerializedFormValues;
}): FormSubmissionSubcategoryItem => ({
  ...subcategory,
  id: subcategory.subcategoryId,
  questions: subcategory.questions.map((question) => {
    responsesFormValues[String(question.questionId)] =
      getInitialQuestionValue(question);
    return toFormSubmissionQuestion(question);
  }),
});

const toFormSubmissionCategory = ({
  category,
  responsesFormValues,
}: {
  category: CategoryItem;
  responsesFormValues: SerializedFormValues;
}): FormSubmissionCategoryItem => ({
  ...category,
  id: category.categoryId,
  categoryChildren: category.categoryChildren.map((child) => {
    if (FormItemUtils.isSubcategoryType(child)) {
      return toFormSubmissionSubcategory({
        subcategory: child,
        responsesFormValues,
      });
    }

    responsesFormValues[String(child.questionId)] =
      getInitialQuestionValue(child);
    return toFormSubmissionQuestion(child);
  }),
});

const buildFormSubmissionData = ({
  formStructure,
}: {
  formStructure: FormStructure;
}): GetFormSubmissionDataResult => {
  const responsesFormValues: SerializedFormValues = {};

  return {
    formStructure: {
      formId: formStructure.formId,
      formName: formStructure.formName,
      categories: formStructure.categories.map((category) =>
        toFormSubmissionCategory({ category, responsesFormValues }),
      ),
      calculations: formStructure.calculations ?? [],
    },
    responsesFormValues,
    geometries: [],
  };
};

const FormPreviewDialog = ({
  open,
  onClose,
  formStructure,
}: {
  open: boolean;
  onClose: () => void;
  formStructure: FormStructure;
}) => {
  const [viewMode, setViewMode] = useState<PreviewViewMode>("form");
  const [showOnlyPublicQuestions, setShowOnlyPublicQuestions] = useState(false);
  const formSubmission = useMemo(
    () => buildFormSubmissionData({ formStructure }),
    [formStructure],
  );
  const [previewValues, setPreviewValues] = useState<FormValues>(
    formSubmission.responsesFormValues,
  );
  const [previewGeometries, setPreviewGeometries] = useState<
    ResponseFormGeometry[]
  >([]);
  const [previewImages, setPreviewImages] = useState<ResponseFormImages>({});

  useEffect(() => {
    setPreviewValues(formSubmission.responsesFormValues);
    setPreviewGeometries([]);
    setPreviewImages({});
    setViewMode("form");
    setShowOnlyPublicQuestions(false);
  }, [formSubmission]);

  const handleValuesChange = useCallback(
    ({ values }: ResponseFormValuesChange) => {
      setPreviewValues({ ...values });
    },
    [],
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
          onChange={(_, option) => setViewMode(option.value)}
        />
      </div>

      <div
        className={
          viewMode === "form" ?
            "flex h-full min-h-0 w-full flex-col pt-16"
          : "hidden"
        }
      >
        <h5 className="text-xl font-bold">Preenchimento</h5>
        <ResponseFormV2
          formSubmission={formSubmission}
          geometries={previewGeometries}
          responseImages={previewImages}
          readOnly={false}
          onValuesChange={handleValuesChange}
          onGeometriesChange={setPreviewGeometries}
          onImagesChange={setPreviewImages}
        />
      </div>

      {viewMode === "result" && (
        <div className="flex w-full flex-col gap-2 pt-16">
          <h5 className="text-xl font-bold">Resultados</h5>
          <CSwitch
            checked={showOnlyPublicQuestions}
            label="Mostrar apenas questões públicas"
            onChange={(_, checked) => setShowOnlyPublicQuestions(checked)}
          />
          <FormSubmissionViewer
            formSubmission={{
              formStructure: formSubmission.formStructure,
              responsesFormValues: previewValues,
              geometries: previewGeometries,
            }}
            filterNonPublicQuestions={showOnlyPublicQuestions}
          />
        </div>
      )}
    </CDialog>
  );
};

export default FormPreviewDialog;
