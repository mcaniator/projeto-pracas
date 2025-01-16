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
import { useEffect, useState } from "react";
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
      if (
        !characteristics.includes(true) &&
        booleanCharacteristicsArray[0] !== undefined
      ) {
        booleanCharacteristicsArray[0] += value;
      } else {
        characteristics.forEach((characteristic, index) => {
          if (characteristic) {
            const previousValue = booleanCharacteristicsArray[index + 1];
            if (previousValue !== undefined)
              booleanCharacteristicsArray[index + 1] = previousValue + value;
          }
        });
      }
    }
  });
  return booleanCharacteristicsArray;
};
const TallyInProgressCharts = ({
  tallyMap,
  isOnModal,
}: {
  tallyMap: Map<string, number>;
  isOnModal: boolean;
}) => {
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setScreenWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);
  const options = {
    indexAxis: `${isOnModal ? "x" : "y"}` as const,
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
        labels: {
          color: `${isOnModal ? "black" : "white"}`,
        },
      },
      title: {
        display: true,
        text: "Título",
        color: `${isOnModal ? "black" : "white"}`,
        font: {
          size: 14,
        },
      },
      datalabels: {
        anchor: "end" as const,
        align: "left" as const,
        color: `${isOnModal ? "black" : "white"}`,
        font: {
          size: 14,
        },
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        ticks: {
          color: `${isOnModal ? "black" : "white"}`,
          precision: 0,
        },
        grid: {
          color: `${isOnModal ? "black" : "white"}`,
        },
      },
      y: {
        stacked: false,
        ticks: {
          color: `${isOnModal ? "black" : "white"}`,
          font: {
            size: 14,
          },
        },
        grid: {
          color: `${isOnModal ? "black" : "white"}`,
        },
      },
    },
    barThickness: isOnModal ? 10 : 20,
  };

  const activityData = {
    labels: ["Sedentários  ", "Caminhando  ", "Vigorosos  "],
    datasets: [
      {
        label: screenWidth < 340 ? "H" : "Homens",
        data: calculateActivityArray(tallyMap, "MALE"),
        backgroundColor: "rgba(79,109,255,255)",
        borderColor: "rgba(79,109,162,255)",
        borderWidth: 1,
      },
      {
        label: screenWidth < 340 ? "M" : "Mulheres",
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
        label: screenWidth < 340 ? "H" : "Homens",
        data: calculateAgeGroupArray(tallyMap, "MALE"),
        backgroundColor: "rgba(79,109,255,255)",
        borderColor: "rgba(79,109,162,255)",
        borderWidth: 1,
      },
      {
        label: screenWidth < 340 ? "M" : "Mulheres",
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
        label: screenWidth < 340 ? "H" : "Homens",
        data: calculateBooleanCharacteristicsArray(tallyMap, "MALE"),
        backgroundColor: "rgba(79,109,255,255)",
        borderColor: "rgba(79,109,162,255)",
        borderWidth: 1,
      },
      {
        label: screenWidth < 340 ? "M" : "Mulheres",
        data: calculateBooleanCharacteristicsArray(tallyMap, "FEMALE"),
        backgroundColor: "rgba(255,67,78,255)",
        borderColor: "rgba(155,67,78,255)",
        borderWidth: 1,
      },
    ],
  };
  return (
    <div
      style={{
        height: isOnModal ? "50vh" : "full",
      }}
      className="flex w-full flex-col overflow-auto"
    >
      <Bar
        className="h-full"
        data={activityData}
        options={{
          ...options,
          maintainAspectRatio: false,
          plugins: {
            ...options.plugins,
            title: { ...options.plugins.title, text: "Atividades físicas" },
          },
        }}
      />
      <Bar
        className="h-full"
        data={ageGroupData}
        options={{
          ...options,
          maintainAspectRatio: false,
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
          maintainAspectRatio: false,
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
