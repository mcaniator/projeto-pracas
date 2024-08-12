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

const calculateActivityArray = (
  tallyMap: Map<string, number>,
  gender: Gender,
) => {
  const activityArray: number[] = [];
  for (const activity of Object.values(Activity)) {
    let count = 0;
    tallyMap.forEach((value, key) => {
      const [keyGender, , keyActivity] = key.split("-");
      if (keyGender === gender && keyActivity === activity) {
        count += value;
      }
    });
    activityArray.push(count);
  }
  return activityArray;
};

const calculateAgeGroupArray = (
  tallyMap: Map<string, number>,
  gender: Gender,
) => {
  const ageGroupArray: number[] = [];
  for (const ageGroup of Object.values(AgeGroup)) {
    let count = 0;
    tallyMap.forEach((value, key) => {
      const [keyGender, keyAgeGroup] = key.split("-");
      if (keyGender === gender && keyAgeGroup === ageGroup) {
        count += value;
      }
    });
    ageGroupArray.push(count);
  }

  return ageGroupArray;
};

const calculateBooleanCharacteristicsArray = (
  tallyMap: Map<string, number>,
  gender: Gender,
) => {
  const booleanCharacteristicsArray: number[] = [0, 0, 0, 0, 0];
  tallyMap.forEach((value, key) => {
    const [
      keyGender,
      ,
      ,
      isTraversing,
      isPersonWithImpairment,
      isInApparentIllicitActivity,
      isPersonWithoutHousing,
    ] = key.split("-");
    if (keyGender === gender) {
      const characteristics = [
        isTraversing === "true",
        isPersonWithImpairment === "true",
        isInApparentIllicitActivity === "true",
        isPersonWithoutHousing === "true",
      ];
      if (!characteristics.includes(true)) {
        booleanCharacteristicsArray[0] += value;
      } else {
        characteristics.forEach((characteristic, index) => {
          if (characteristic) booleanCharacteristicsArray[index + 1] += value;
        });
      }
    }
  });
  return booleanCharacteristicsArray;
};
const TallyInProgressCharts = ({
  tallyMap,
}: {
  tallyMap: Map<string, number>;
}) => {
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
        text: "Título",
        color: "white",
        font: {
          size: 14,
        },
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
          font: {
            size: 14,
          },
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
        data: calculateActivityArray(tallyMap, "MALE"),
        backgroundColor: "rgba(79,109,255,255)",
        borderColor: "rgba(79,109,162,255)",
        borderWidth: 1,
      },
      {
        label: "Mulheres",
        data: calculateActivityArray(tallyMap, "FEMALE"),
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
        data: calculateAgeGroupArray(tallyMap, "MALE"),
        backgroundColor: "rgba(79,109,255,255)",
        borderColor: "rgba(79,109,162,255)",
        borderWidth: 1,
      },
      {
        label: "Mulheres",
        data: calculateAgeGroupArray(tallyMap, "FEMALE"),
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
        data: calculateBooleanCharacteristicsArray(tallyMap, "MALE"),
        backgroundColor: "rgba(79,109,255,255)",
        borderColor: "rgba(79,109,162,255)",
        borderWidth: 1,
      },
      {
        label: "Mulheres",
        data: calculateBooleanCharacteristicsArray(tallyMap, "FEMALE"),
        backgroundColor: "rgba(255,67,78,255)",
        borderColor: "rgba(155,67,78,255)",
        borderWidth: 1,
      },
    ],
  };
  return (
    <div style={{ width: "30rem" }} className="flex flex-col overflow-auto">
      <Bar
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

export { TallyInProgressCharts };
