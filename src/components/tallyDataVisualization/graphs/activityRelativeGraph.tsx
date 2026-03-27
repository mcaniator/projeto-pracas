import { Box } from "@mui/material";
import { TooltipItem } from "chart.js";
import { ArcElement, Chart as ChartJS, Legend, Tooltip } from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { Pie } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend, ChartDataLabels);
const ActivityRelativeGraph = ({
  tallyMap,
}: {
  tallyMap: Map<string, number>;
}) => {
  const genderData = {
    labels: [
      `Sedentários: ${tallyMap.get("Tot-SEDENTARY")}`,
      `Caminhando: ${tallyMap.get("Tot-WALKING")}`,
      `Vigorosos: ${tallyMap.get("Tot-STRENUOUS")}`,
    ],
    datasets: [
      {
        data: [
          tallyMap.get("%SEDENTARY")?.toFixed(2) ?? 0,
          tallyMap.get("%WALKING")?.toFixed(2) ?? 0,
          tallyMap.get("%STRENUOUS")?.toFixed(2) ?? 0,
        ],
        backgroundColor: [
          "rgba(79,109,255,255)",
          "rgba(255,67,78,255)",
          "rgba(34,197,94,1)",
        ],
      },
    ],
  };
  const options = {
    plugins: {
      datalabels: {
        color: "white",
        formatter: (value: string) => {
          return `${value}%`;
        },
      },
      legend: {
        labels: {
          color: "black",
        },
      },
      title: {
        display: true,
        text: "Atividade Física",
        color: "black",
        font: {
          size: 14,
        },
      },
      tooltip: {
        callbacks: {
          label: function (context: TooltipItem<"pie">) {
            const value = context.raw as number;
            return `${value}%`;
          },
        },
      },
    },
  };

  return (
    <Box
      sx={{
        maxHeight: "300px",
        maxWidth: "100%",
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        alignItems: "center",
        overflow: "auto",
      }}
    >
      <Pie data={genderData} options={options} />
    </Box>
  );
};

export default ActivityRelativeGraph;
