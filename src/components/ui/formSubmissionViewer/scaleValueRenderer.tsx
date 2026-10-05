import type { FormSubmissionQuestionItem } from "@/lib/serverFunctions/queries/formSubmission";
import { Box } from "@mui/material";
import { IconChevronDown } from "@tabler/icons-react";

import QuestionIcon from "./questionIcon";
import type { QuestionIconGeometryProps } from "./questionIcon";

export const ScaleValueRenderer = ({
  question,
  value,
  hasGeometries,
  onMapChipClick,
}: {
  question: FormSubmissionQuestionItem;
  value: number;
} & QuestionIconGeometryProps) => {
  if (question.minValue == null || question.maxValue == null) return null;
  const { minValue, maxValue } = question;

  const percentage =
    maxValue === minValue ? 0 : (
      ((value - minValue) / (maxValue - minValue)) * 100
    );

  return (
    <div className="flex w-full items-center gap-3">
      <QuestionIcon
        question={question}
        hasValue={true}
        hasGeometries={hasGeometries}
        onMapChipClick={onMapChipClick}
      />

      <div className="relative w-full">
        <Box
          sx={{
            width: "100%",
            height: "16px",
            borderRadius: "calc(infinity * 1px)",
            backgroundColor: "#E8EAED",
          }}
        />

        <Box
          sx={{
            width: `${percentage}%`,
            position: "absolute",
            backgroundColor: "primary.main",
            height: "14px",
            top: "1px",
            left: "0",
            borderRadius: "calc(infinity * 1px)",
          }}
        />

        <div
          className={`absolute -top-3 flex flex-col ${Math.abs(value) < 10 && Number.isInteger(value) ? "items-center" : ""}`}
          style={{ left: `calc(${percentage}% - 8px)` }}
        >
          <span className="text-xs font-medium">{value}</span>
          <IconChevronDown size={16} className="-mt-2" />
        </div>
        <div className="absolute -bottom-4 left-0 flex w-full justify-between text-xs text-gray-500">
          <span>{minValue}</span>
          <span>{maxValue}</span>
        </div>
      </div>
    </div>
  );
};
