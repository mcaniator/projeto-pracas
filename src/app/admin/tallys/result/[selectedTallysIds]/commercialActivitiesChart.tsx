"use client";

import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Title,
  Tooltip,
} from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartDataLabels,
);

const CommercialActivitiesChart = ({
  sortedCommercialActivitiesNames,
  sortedOccurrences,
}: {
  sortedCommercialActivitiesNames: string[];
  sortedOccurrences: number[];
}) => {
  const options = {
    maintainAspectRatio: false,
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: "Título",
        color: "black",
        font: {
          size: 14,
        },
      },
      datalabels: {
        anchor: "center" as const,
        align: "center" as const,
        color: "black",
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        ticks: {
          color: "black",
        },
        grid: {
          color: "black",
        },
      },
      y: {
        ticks: {
          color: "black",
          font: {
            size: 14,
          },
          precision: 0,
        },
        grid: {
          color: "black",
        },
      },
    },
  };

  const commercialActivitiesData = {
    labels: sortedCommercialActivitiesNames,
    datasets: [
      {
        data: sortedOccurrences,
        backgroundColor: "rgb(148,0,211)",
        borderColor: "rgb(153,50,204)",
        borderWidth: 1,
      },
    ],
  };
  return (
    <Bar
      className="h-full max-h-[70vh]"
      data={commercialActivitiesData}
      options={{
        ...options,
        plugins: {
          ...options.plugins,
          title: {
            ...options.plugins.title,
            text: "Atividades comerciais itinerantes",
          },
        },
      }}
    />
  );
};

export { CommercialActivitiesChart };
