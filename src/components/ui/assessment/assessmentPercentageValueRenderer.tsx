"use client";

import { AssessmentQuestionItem } from "@/lib/serverFunctions/queries/assessment";
import { Box } from "@mui/material";
import { ArcElement, Chart as ChartJS, Legend, Tooltip } from "chart.js";
import { Pie } from "react-chartjs-2";

import AssessmentQuestionIcon from "./assessmentQuestionIcon";

ChartJS.register(ArcElement, Tooltip, Legend);

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
      <AssessmentQuestionIcon question={question} hasValue={value !== 0} />
      <Box
        sx={{
          width: 310,
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
