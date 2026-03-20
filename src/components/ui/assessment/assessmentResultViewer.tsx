"use client";

import { FormValues } from "@/app/admin/assessments/[selectedAssessmentId]/responseFormV2";
import CIconChip from "@/components/ui/cIconChip";
import CDialogTrigger from "@/components/ui/dialog/cDialogTrigger";
import CDynamicIcon from "@/components/ui/dynamicIcon/cDynamicIcon";
import {
  AssessmentCategoryItem,
  AssessmentQuestionItem,
  AssessmentSubcategoryItem,
} from "@/lib/serverFunctions/queries/assessment";
import { Box, Chip, Divider } from "@mui/material";
import { IconInfoCircle } from "@tabler/icons-react";
import { ArcElement, Chart as ChartJS, Legend, Tooltip } from "chart.js";
import { useMemo } from "react";
import { Pie } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

type AssessmentTree = {
  categories: AssessmentCategoryItem[];
  responsesFormValues: FormValues;
};

type ResolvedQuestionValue =
  | { kind: "none" }
  | { kind: "boolean"; value: boolean }
  | { kind: "text"; values: string[] }
  | { kind: "number"; values: number[] };

const getQuestionRawValue = (
  assessment: AssessmentTree,
  question: AssessmentQuestionItem,
) => {
  return assessment.responsesFormValues[question.questionId];
};

const getQuestionOptionTextMap = (question: AssessmentQuestionItem) => {
  return new Map(
    (question.options ?? []).map((option) => [option.id, option.text]),
  );
};

const resolveSelectedOptionTexts = (
  question: AssessmentQuestionItem,
  rawValue: string | number | number[] | boolean | null | undefined,
) => {
  const optionTextMap = getQuestionOptionTextMap(question);

  if (question.optionType === "RADIO") {
    if (rawValue === null || rawValue === undefined) {
      return [];
    }

    const optionId = Number(rawValue);
    if (Number.isNaN(optionId)) {
      return [];
    }

    const optionText = optionTextMap.get(optionId);
    return optionText !== undefined && optionText.trim().length > 0 ?
        [optionText]
      : [];
  }

  if (question.optionType === "CHECKBOX") {
    if (!Array.isArray(rawValue)) {
      return [];
    }

    return rawValue
      .map((optionId) => optionTextMap.get(optionId))
      .filter(
        (optionText): optionText is string =>
          optionText !== undefined && optionText.trim().length > 0,
      );
  }

  return [];
};

export const resolveAssessmentQuestionValue = (
  assessment: AssessmentTree,
  question: AssessmentQuestionItem,
): ResolvedQuestionValue => {
  const rawValue = getQuestionRawValue(assessment, question);

  if (rawValue === null || rawValue === undefined) {
    return { kind: "none" };
  }

  if (question.questionType === "BOOLEAN") {
    if (typeof rawValue !== "boolean") {
      return { kind: "none" };
    }

    return { kind: "boolean", value: rawValue };
  }

  if (question.questionType === "OPTIONS") {
    const optionTexts = resolveSelectedOptionTexts(question, rawValue);
    if (optionTexts.length === 0) {
      return { kind: "none" };
    }

    if (
      question.characterType === "NUMBER" ||
      question.characterType === "PERCENTAGE"
    ) {
      const numericValues = optionTexts
        .map((optionText) => Number(optionText))
        .filter((value) => Number.isFinite(value));

      if (numericValues.length === 0) {
        return { kind: "none" };
      }

      return { kind: "number", values: numericValues };
    }

    return { kind: "text", values: optionTexts };
  }

  if (
    question.characterType === "NUMBER" ||
    question.characterType === "PERCENTAGE"
  ) {
    if (typeof rawValue === "number" && Number.isFinite(rawValue)) {
      return { kind: "number", values: [rawValue] };
    }

    if (typeof rawValue === "string") {
      const numericValue = Number(rawValue);
      if (Number.isFinite(numericValue)) {
        return { kind: "number", values: [numericValue] };
      }
    }

    return { kind: "none" };
  }

  if (typeof rawValue === "string") {
    const trimmedValue = rawValue.trim();
    if (trimmedValue.length === 0) {
      return { kind: "none" };
    }

    return { kind: "text", values: [trimmedValue] };
  }

  return { kind: "none" };
};

const QuestionIcon = ({
  question,
  hasValue,
}: {
  question: AssessmentQuestionItem;
  hasValue: boolean;
}) => {
  return (
    <CIconChip
      icon={<CDynamicIcon iconKey={question.iconKey} />}
      tooltip={question.name}
      variant={hasValue ? "emphasis" : "disabled"}
    />
  );
};

export const AssessmentBooleanValueRenderer = ({
  question,
  value,
}: {
  question: AssessmentQuestionItem;
  value: boolean;
}) => {
  return (
    <CIconChip
      icon={<CDynamicIcon iconKey={question.iconKey} />}
      tooltip={question.name}
      variant={value ? "emphasis" : "disabled"}
    />
  );
};

export const AssessmentTextValueRenderer = ({
  question,
  value,
}: {
  question: AssessmentQuestionItem;
  value: string;
}) => {
  return (
    <div className="flex items-center gap-2">
      <QuestionIcon question={question} hasValue={value.length > 0} />
      <span className="break-all">{value}</span>
    </div>
  );
};

export const AssessmentNumericValueRenderer = ({
  question,
  value,
}: {
  question: AssessmentQuestionItem;
  value: number;
}) => {
  return (
    <div className="relative inline-flex">
      <QuestionIcon question={question} hasValue={value !== 0} />
      <Chip
        label={value}
        size="small"
        color="primary"
        disabled={value === 0}
        sx={{
          position: "absolute",
          top: -6,
          left: 20,
          height: 20,
          fontSize: "0.7rem",
        }}
      />
    </div>
  );
};

export const AssessmentPercentageValueRenderer = ({
  question,
  value,
}: {
  question: AssessmentQuestionItem;
  value: number;
}) => {
  const boundedValue = Math.max(0, Math.min(100, value));
  const percentageData = {
    labels: [`${question.name}`, ``],
    datasets: [
      {
        data: [boundedValue, 100 - boundedValue],
        backgroundColor: ["#648547", "rgba(224, 224, 224, 0.9)"],
        borderWidth: 0,
      },
    ],
  };

  return (
    <div className="flex items-center gap-2">
      <QuestionIcon question={question} hasValue={value !== 0} />
      <Box
        sx={{
          width: "100%",
          height: 128,
        }}
      >
        <Pie
          key={boundedValue}
          data={percentageData}
          plugins={[
            {
              id: "footerText",
              afterDraw(chart) {
                const { ctx, chartArea } = chart;

                const centerX = (chartArea.left + chartArea.right) / 2;
                const centerY = chartArea.bottom + 12;

                ctx.save();
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.font = "12px sans-serif";

                ctx.fillText(`${boundedValue}%`, centerX, centerY);

                ctx.restore();
              },
            },
          ]}
          options={{
            layout: {
              padding: {
                bottom: 24,
                right: 200,
              },
            },
            responsive: true,
            maintainAspectRatio: false,
            hover: {
              mode: undefined,
            },
            plugins: {
              legend: {
                display: false,
              },
              tooltip: {
                enabled: true,
                filter: function (context) {
                  return context.dataIndex === 0;
                },
                callbacks: {
                  label: function (context) {
                    const value = context.raw as number;
                    return `${value}%`;
                  },
                },
              },
            },
            elements: {
              arc: {
                hoverOffset: 0,
              },
            },
          }}
        />
      </Box>
    </div>
  );
};

const AssessmentResultViewer = ({
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

  if (resolvedValue.kind === "none") {
    return null;
  }

  if (
    question.characterType === "BOOLEAN" &&
    resolvedValue.kind === "boolean"
  ) {
    return (
      <AssessmentBooleanValueRenderer
        question={question}
        value={resolvedValue.value}
      />
    );
  }

  if (question.characterType === "TEXT" && resolvedValue.kind === "text") {
    return (
      <>
        {resolvedValue.values.map((value, index) => (
          <AssessmentTextValueRenderer
            key={`${question.questionId}-text-${index}`}
            question={question}
            value={value}
          />
        ))}
      </>
    );
  }

  if (question.characterType === "NUMBER" && resolvedValue.kind === "number") {
    return (
      <>
        {resolvedValue.values.map((value, index) => (
          <AssessmentNumericValueRenderer
            key={`${question.questionId}-number-${index}`}
            question={question}
            value={value}
          />
        ))}
      </>
    );
  }

  if (
    question.characterType === "PERCENTAGE" &&
    resolvedValue.kind === "number"
  ) {
    return (
      <>
        {resolvedValue.values.map((value, index) => (
          <AssessmentPercentageValueRenderer
            key={`${question.questionId}-percentage-${index}`}
            question={question}
            value={value}
          />
        ))}
      </>
    );
  }

  return null;
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
    <div className="flex flex-col gap-2">
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
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <h4 className="font-semibold">{category.name}</h4>
        <span>
          <IconsLegendDialog categoryIcons={categoryIcons} />
        </span>
      </div>

      <div className="flex flex-col gap-3">
        {category.categoryChildren.map((child) =>
          isAssessmentSubcategoryItem(child) ?
            <Subcategory
              key={child.id}
              assessment={assessment}
              subcategory={child}
            />
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

export default AssessmentResultViewer;
