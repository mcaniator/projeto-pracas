"use client";

import { Activity, AgeGroup, Gender } from "@prisma/client";
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

const calculateActivityCount = (
  tallyMap: Map<string, number>,
  gender: Gender,
  activity: Activity,
) => {
  let count = 0;
  //console.log(tallyMap)
  tallyMap.forEach((value, key) => {
    const [keyGender, , keyActivity] = key.split("-");
    if (keyGender === gender && keyActivity === activity) {
      count += value;
    }
  });

  return count;
};
const OngoingTallyCharts = ({
  tallyMap,
}: {
  tallyMap: Map<string, number>;
}) => {
  const data = {
    labels: ["Sedentários", "Caminhando", "Vigorosos"],
    datasets: [
      {
        label: "Homens",
        data: [
          calculateActivityCount(tallyMap, "MALE", "SEDENTARY"),
          calculateActivityCount(tallyMap, "MALE", "WALKING"),
          calculateActivityCount(tallyMap, "MALE", "STRENUOUS"),
        ],
        backgroundColor: "rgba(79,109,255,255)",
        borderColor: "rgba(79,109,162,255)",
        borderWidth: 1,
      },
      {
        label: "Mulheres",
        data: [
          calculateActivityCount(tallyMap, "FEMALE", "SEDENTARY"),
          calculateActivityCount(tallyMap, "FEMALE", "WALKING"),
          calculateActivityCount(tallyMap, "FEMALE", "STRENUOUS"),
        ],
        backgroundColor: "rgba(255,67,78,255)",
        borderColor: "rgba(155,67,78,255)",
        borderWidth: 1,
      },
    ],
  };

  const options = {
    indexAxis: "y" as const,
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
        text: "Atividades",
        color: "white",
      },
      datalabels: {
        anchor: "end" as const,
        align: "left" as const,
        color: "white",
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        ticks: {
          color: "white",
          precision: 0,
        },
        grid: {
          color: "white",
        },
      },
      y: {
        stacked: false,
        ticks: {
          color: "white",
        },
        grid: {
          color: "white",
        },
      },
    },
  };

  return <Bar data={data} options={options} />;
};

export { OngoingTallyCharts };
