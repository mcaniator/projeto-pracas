"use client";

import QuestionResponseRenderer from "@/components/ui/assessment/questionResponseRenderer";
import ResponseFormCategory from "@/components/ui/responseForm/responseFormCategory";
import ResponseFormQuestionCard from "@/components/ui/responseForm/responseFormQuestionCard";
import ResponseFormQuestionGeometryControls from "@/components/ui/responseForm/responseFormQuestionGeometryControls";
import ResponseFormSubcategory from "@/components/ui/responseForm/responseFormSubcategory";
import {
  ResponseFormGeometry,
  ResponseQuestionValue,
} from "@/components/ui/responseForm/responseFormTypes";
import ResponseQuestionFieldRenderer from "@/components/ui/responseForm/responseQuestionFieldRenderer";
import type { AssessmentQuestionItem } from "@/lib/serverFunctions/queries/assessment";
import { resolveQuestionValue } from "@/lib/utils/assessmentResultViewer/assessmentResultViewerUtils";
import { useMemo, useState } from "react";

import type { QuestionCreationDraft } from "./questionCreationTypes";

const buildPreviewQuestion = ({
  draft,
  categoryName,
  subcategoryName,
}: {
  draft: QuestionCreationDraft;
  categoryName: string | undefined;
  subcategoryName: string | undefined;
}): AssessmentQuestionItem => {
  const options =
    draft.questionType === "OPTIONS" ?
      draft.options.map((option, index) => ({
        id: -(index + 1),
        text: option.text,
      }))
    : [];

  return {
    id: -1,
    position: 0,
    questionId: -1,
    name: draft.name || "Questão sem título",
    iconKey: draft.iconKey,
    isPublic: draft.isPublic,
    notes: draft.notes,
    questionType: draft.questionType,
    characterType: draft.characterType,
    optionType: draft.optionType,
    categoryName: categoryName ?? "",
    subcategoryName: subcategoryName ?? null,
    options,
    geometryTypes: draft.hasAssociatedGeometry ? draft.geometryTypes : [],
    scaleConfig: draft.scaleConfig,
    calculationExpression: undefined,
  };
};

const QuestionCreationPreviewStep = ({
  draft,
  categoryName,
  subcategoryName,
}: {
  draft: QuestionCreationDraft;
  categoryName: string | undefined;
  subcategoryName: string | undefined;
}) => {
  const previewQuestion = useMemo(
    () => buildPreviewQuestion({ draft, categoryName, subcategoryName }),
    [draft, categoryName, subcategoryName],
  );
  const [value, setValue] = useState<ResponseQuestionValue>(null);
  const [geometries, setGeometries] = useState<ResponseFormGeometry[]>([]);

  const resolvedValue = resolveQuestionValue(previewQuestion, value);
  const questionCard = (
    <ResponseFormQuestionCard
      question={previewQuestion}
      questionsForMention={[]}
      geometryControls={
        <ResponseFormQuestionGeometryControls
          question={previewQuestion}
          geometries={geometries}
          locationPolygonGeoJson={null}
          finalized={false}
          handleQuestionGeometryChange={(nextGeometry) => {
            setGeometries((prev) => {
              if (
                prev.some(
                  (geometry) => geometry.questionId === nextGeometry.questionId,
                )
              ) {
                return prev.map((geometry) =>
                  geometry.questionId === nextGeometry.questionId ?
                    nextGeometry
                  : geometry,
                );
              }

              return [...prev, nextGeometry];
            });
          }}
        />
      }
    >
      <ResponseQuestionFieldRenderer
        question={previewQuestion}
        value={value}
        disableDebouce
        onChange={setValue}
      />
    </ResponseFormQuestionCard>
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <h5 className="text-base font-semibold">Preenchimento</h5>
        <ResponseFormCategory
          category={{ name: categoryName ?? "Categoria", notes: null }}
        >
          {subcategoryName ?
            <ResponseFormSubcategory
              subcategory={{ name: subcategoryName, notes: null }}
            >
              <>{questionCard}</>
            </ResponseFormSubcategory>
          : <>{questionCard}</>}
        </ResponseFormCategory>
      </div>

      <div className="flex flex-col gap-2">
        <h5 className="text-base font-semibold">Visualização</h5>
        <QuestionResponseRenderer
          question={previewQuestion}
          resolvedValue={resolvedValue}
          isPreview
        />
      </div>
    </div>
  );
};

export default QuestionCreationPreviewStep;
