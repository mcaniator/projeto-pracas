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

import { TallyDataArraysByGender } from "./personsDataVisualization";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartDataLabels,
);

const PersonsDataVisualizationCharts = ({
  activityArrays,
  ageGroupArrays,
  booleanCharacteristicsArrays,
}: {
  activityArrays: TallyDataArraysByGender;
  ageGroupArrays: TallyDataArraysByGender;
  booleanCharacteristicsArrays: TallyDataArraysByGender;
}) => {
  const options = {
    maintainAspectRatio: false,
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
        labels: {
          color: "white",
        },
      },
      title: {
        display: true,
        text: "Título",
        color: "white",
        font: {
          size: 14,
        },
      },
      datalabels: {
        anchor: "center" as const,
        align: "center" as const,
        color: "white",
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        ticks: {
          color: "white",
        },
        grid: {
          color: "white",
        },
      },
      y: {
        stacked: false,
        ticks: {
          color: "white",
          font: {
            size: 14,
          },
          precision: 0,
        },
        grid: {
          color: "white",
        },
      },
    },
  };

  const activityData = {
    labels: ["Sedentários  ", "Caminhando  ", "Vigorosos  "],
    datasets: [
      {
        label: "Homens",
        data: activityArrays.MALE,
        backgroundColor: "rgba(79,109,255,255)",
        borderColor: "rgba(79,109,162,255)",
        borderWidth: 1,
      },
      {
        label: "Mulheres",
        data: activityArrays.FEMALE,
        backgroundColor: "rgba(255,67,78,255)",
        borderColor: "rgba(155,67,78,255)",
        borderWidth: 1,
      },
    ],
  };

  const ageGroupData = {
    labels: ["Crianças  ", "Jovens  ", "Adultos  ", "Idosos  "],
    datasets: [
      {
        label: "Homens",
        data: ageGroupArrays.MALE,
        backgroundColor: "rgba(79,109,255,255)",
        borderColor: "rgba(79,109,162,255)",
        borderWidth: 1,
      },
      {
        label: "Mulheres",
        data: ageGroupArrays.FEMALE,
        backgroundColor: "rgba(255,67,78,255)",
        borderColor: "rgba(155,67,78,255)",
        borderWidth: 1,
      },
    ],
  };

  const booleanCharacteristicsData = {
    labels: [
      "Padrão  ",
      "Passando  ",
      "Deficiente  ",
      "Atividade ilícita  ",
      "Situação de rua  ",
    ],
    datasets: [
      {
        label: "Homens",
        data: booleanCharacteristicsArrays.MALE,
        backgroundColor: "rgba(79,109,255,255)",
        borderColor: "rgba(79,109,162,255)",
        borderWidth: 1,
      },
      {
        label: "Mulheres",
        data: booleanCharacteristicsArrays.FEMALE,
        backgroundColor: "rgba(255,67,78,255)",
        borderColor: "rgba(155,67,78,255)",
        borderWidth: 1,
      },
    ],
  };
  return (
    <div className="flex flex-col overflow-auto">
      <Bar
        className="h-full max-h-[70vh]"
        data={activityData}
        options={{
          ...options,
          plugins: {
            ...options.plugins,
            title: { ...options.plugins.title, text: "Atividades físicas" },
          },
        }}
      />
      <Bar
        className="h-full max-h-[70vh]"
        data={ageGroupData}
        options={{
          ...options,
          plugins: {
            ...options.plugins,
            title: { ...options.plugins.title, text: "Faixa etária" },
          },
        }}
      />
      <Bar
        className="h-full max-h-[70vh]"
        data={booleanCharacteristicsData}
        options={{
          ...options,
          plugins: {
            ...options.plugins,
            title: {
              ...options.plugins.title,
              text: "Características binárias",
            },
          },
        }}
      />
    </div>
  );
};

export { PersonsDataVisualizationCharts };
