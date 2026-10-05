"use client";

import type { FormSubmissionQuestionItem } from "@/lib/serverFunctions/queries/formSubmission";
import { Box } from "@mui/material";
import { ArcElement, Chart as ChartJS, Legend, Tooltip } from "chart.js";
import { Pie } from "react-chartjs-2";

import QuestionIcon from "./questionIcon";
import type { QuestionIconGeometryProps } from "./questionIcon";

ChartJS.register(ArcElement, Tooltip, Legend);

export const PercentageValueRenderer = ({
  question,
  value,
  hasGeometries,
  onMapChipClick,
}: {
  question: FormSubmissionQuestionItem;
  value: number;
} & QuestionIconGeometryProps) => {
  const boundedValue = Math.max(0, Math.min(100, value));
  const percentageData = {
    labels: [`${question.name}`, ``],
    datasets: [
      {
        data: [boundedValue, 100 - boundedValue],
        backgroundColor:
          value > 100 ?
            ["#ed6c02", "rgba(224, 224, 224, 0.9)"]
          : ["#648547", "rgba(224, 224, 224, 0.9)"],
        borderWidth: 0,
      },
    ],
  };

  return (
    <div className="flex items-center gap-1">
      <QuestionIcon
        question={question}
        hasValue={value !== 0}
        hasGeometries={hasGeometries}
        onMapChipClick={onMapChipClick}
      />
      <Box
        sx={{
          width: 128,
          height: 128,
          flex: "0 0 128px",
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

                ctx.fillText(`${value}%`, centerX, centerY);

                ctx.restore();
              },
            },
          ]}
          options={{
            layout: {
              padding: {
                bottom: 24,
              },
            },
            responsive: true,
            maintainAspectRatio: false,
            hover: {
              mode: undefined,
            },
            plugins: {
              datalabels: {
                display: false,
              },
              legend: {
                display: false,
              },
              tooltip: {
                enabled: false,
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
