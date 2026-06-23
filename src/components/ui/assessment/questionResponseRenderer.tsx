"use client";

import { AssessmentQuestionItem } from "@/lib/serverFunctions/queries/assessment";
import type { ResponseGeometry } from "@/lib/types/assessments/geometry";
import { type ReactNode, useState } from "react";

import { AssessmentBooleanValueRenderer } from "./assessmentBooleanValueRenderer";
import AssessmentGeometryDialog from "./assessmentGeometryDialog";
import { AssessmentNumericValueRenderer } from "./assessmentNumericValueRenderer";
import { AssessmentPercentageValueRenderer } from "./assessmentPercentageValueRenderer";
import { AssessmentScaleValueRenderer } from "./assessmentScaleValueRenderer";
import { AssessmentTextValueRenderer } from "./assessmentTextValueRenderer";
import { AssessmentUnfilledValueRenderer } from "./assessmentUnfilledValueRenderer";

export type ResolvedQuestionValue =
  | { kind: "none" }
  | { kind: "boolean"; value: boolean }
  | { kind: "text"; values: string[] }
  | { kind: "number"; values: number[] };

const QuestionResponseRenderer = ({
  question,
  resolvedValue,
  isPreview = false,
  geometries = [],
  locationPolygonGeoJson = null,
}: {
  question: AssessmentQuestionItem;
  resolvedValue: ResolvedQuestionValue;
  isPreview?: boolean;
  geometries?: ResponseGeometry[];
  locationPolygonGeoJson?: string | null;
}) => {
  const [openGeometryDialog, setOpenGeometryDialog] = useState(false);
  const keyPrefix = isPreview ? "preview" : question.questionId;
  const hasGeometries = geometries.length > 0;
  const geometryRendererProps = {
    hasGeometries,
    onMapChipClick: () => setOpenGeometryDialog(true),
  };
  const renderWithGeometryDialog = (content: ReactNode) => (
    <>
      {content}
      {hasGeometries && (
        <AssessmentGeometryDialog
          open={openGeometryDialog}
          onClose={() => setOpenGeometryDialog(false)}
          questionName={question.name}
          geometries={geometries}
          locationPolygonGeoJson={locationPolygonGeoJson}
        />
      )}
    </>
  );
  if (resolvedValue.kind === "none") {
    return renderWithGeometryDialog(
      <AssessmentUnfilledValueRenderer
        question={question}
        {...geometryRendererProps}
      />,
    );
  }

  if (
    question.characterType === "BOOLEAN" &&
    resolvedValue.kind === "boolean"
  ) {
    return renderWithGeometryDialog(
      <div className="flex flex-wrap gap-4">
        <AssessmentBooleanValueRenderer
          question={question}
          value={resolvedValue.value}
          {...geometryRendererProps}
        />
      </div>,
    );
  }

  if (
    (question.characterType === "TEXT" ||
      question.characterType === "DATE" ||
      question.characterType === "TIME" ||
      question.characterType === "DATETIME") &&
    resolvedValue.kind === "text"
  ) {
    return renderWithGeometryDialog(
      <div className="flex flex-wrap gap-4">
        {resolvedValue.values.map((value, index) => (
          <AssessmentTextValueRenderer
            key={`${keyPrefix}-text-${index}`}
            question={question}
            value={value}
            {...geometryRendererProps}
          />
        ))}
      </div>,
    );
  }

  if (question.characterType === "NUMBER" && resolvedValue.kind === "number") {
    return renderWithGeometryDialog(
      <div className="flex flex-wrap gap-4">
        {resolvedValue.values.map((value, index) => (
          <AssessmentNumericValueRenderer
            key={`${keyPrefix}-number-${index}`}
            question={question}
            value={value}
            {...geometryRendererProps}
          />
        ))}
      </div>,
    );
  }

  if (question.characterType === "SCALE" && resolvedValue.kind === "number") {
    return renderWithGeometryDialog(
      <>
        {resolvedValue.values.map((value, index) => (
          <AssessmentScaleValueRenderer
            key={`${keyPrefix}-scale-${index}`}
            question={question}
            value={value}
            {...geometryRendererProps}
          />
        ))}
      </>,
    );
  }

  if (
    question.characterType === "PERCENTAGE" &&
    resolvedValue.kind === "number"
  ) {
    return renderWithGeometryDialog(
      <>
        {resolvedValue.values.map((value, index) => (
          <AssessmentPercentageValueRenderer
            key={`${keyPrefix}-percentage-${index}`}
            question={question}
            value={value}
            {...geometryRendererProps}
          />
        ))}
      </>,
    );
  }

  return null;
};

export default QuestionResponseRenderer;
