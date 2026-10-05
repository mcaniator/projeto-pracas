"use client";

import type { FormSubmissionQuestionItem } from "@/lib/serverFunctions/queries/formSubmission";
import type { ResponseGeometry } from "@/lib/types/formSubmission/responseFormTypes";
import { type ReactNode, useState } from "react";

import { BooleanValueRenderer } from "./booleanValueRenderer";
import FormSubmissionGeometryDialog from "./geometryDialog";
import { NumericValueRenderer } from "./numericValueRenderer";
import { PercentageValueRenderer } from "./percentageValueRenderer";
import { ScaleValueRenderer } from "./scaleValueRenderer";
import { TextValueRenderer } from "./textValueRenderer";
import { UnfilledValueRenderer } from "./unfilledValueRenderer";

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
  question: FormSubmissionQuestionItem;
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
        <FormSubmissionGeometryDialog
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
      <UnfilledValueRenderer question={question} {...geometryRendererProps} />,
    );
  }

  if (
    question.characterType === "BOOLEAN" &&
    resolvedValue.kind === "boolean"
  ) {
    return renderWithGeometryDialog(
      <div className="flex flex-wrap gap-4">
        <BooleanValueRenderer
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
          <TextValueRenderer
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
          <NumericValueRenderer
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
          <ScaleValueRenderer
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
          <PercentageValueRenderer
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
