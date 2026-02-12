"use client";

import { TallyDataArraysByGender } from "@/app/admin/tallys/result/[selectedTallysIds]/personsDataVisualization";
import { Activity, AgeGroup, Gender } from "@enums/personCharacteristics";
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

const booleanCharacteristicsInOrder = [
  "noBooleanCharacteristic",
  "isTraversing",
  "isPersonWithImpairment",
  "isInApparentIllicitActivity",
  "isPersonWithoutHousing",
];

const calculateActivityArrays = (tallyMap: Map<string, string | number>) => {
  const activityArrays: TallyDataArraysByGender = { MALE: [], FEMALE: [] };
  for (const gender of Object.keys(Gender)) {
    const activityArray: number[] = [];
    for (const activity of Object.values(Activity)) {
      let count = 0;
      tallyMap.forEach((value, key) => {
        const [keyGender, , keyActivity] = key.split("-");
        if (keyGender === gender && keyActivity === activity) {
          if (typeof value === "number") count += value;
        }
      });
      activityArray.push(count);
    }
    activityArrays[gender as keyof TallyDataArraysByGender] = activityArray;
  }
  return activityArrays;
};
const calculateAgeGroupArrays = (tallyMap: Map<string, string | number>) => {
  const ageGroupArrays: TallyDataArraysByGender = { MALE: [], FEMALE: [] };
  for (const gender of Object.keys(Gender)) {
    const ageGroupArray: number[] = [];
    for (const ageGroup of Object.values(AgeGroup)) {
      let count = 0;
      tallyMap.forEach((value, key) => {
        const [keyGender, keyAgeGroup] = key.split("-");
        if (keyGender === gender && keyAgeGroup === ageGroup) {
          if (typeof value === "number") count += value;
        }
      });
      ageGroupArray.push(count);
    }
    ageGroupArrays[gender as keyof TallyDataArraysByGender] = ageGroupArray;
  }
  return ageGroupArrays;
};

const calculateBooleanCharacteristicsArrays = (
  tallyMap: Map<string, string | number>,
) => {
  const booleanCharacteristicsArrays: TallyDataArraysByGender = {
    MALE: [],
    FEMALE: [],
  };
  for (const gender of Object.keys(Gender)) {
    const booleanCharacteristicsArray: number[] = [0, 0, 0, 0, 0];
    booleanCharacteristicsInOrder.forEach((characteristic, index) => {
      tallyMap.forEach((value, key) => {
        const [keyGender, booleanCharacteristic] = key.split("-");
        if (
          booleanCharacteristic &&
          characteristic === booleanCharacteristic &&
          gender === keyGender
        ) {
          if (typeof value === "number") {
            booleanCharacteristicsArray[index] = value;
          }
        }
      });
    });
    booleanCharacteristicsArrays[gender as keyof TallyDataArraysByGender] =
      booleanCharacteristicsArray;
  }
  return booleanCharacteristicsArrays;
};

const AbsoluteGraphs = ({ tallyMap }: { tallyMap: Map<string, number> }) => {
  const activityArrays = calculateActivityArrays(tallyMap);
  const ageGroupArrays = calculateAgeGroupArrays(tallyMap);
  const booleanCharacteristicsArrays =
    calculateBooleanCharacteristicsArrays(tallyMap);
  const options = {
    maintainAspectRatio: false,
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
        labels: {
          color: "black",
        },
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
        stacked: false,
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
      "PCD  ",
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
    <div className="flex flex-wrap gap-1">
      <Bar
        className="h-full max-h-60 w-full"
        data={activityData}
        options={{
          ...options,
          plugins: {
            ...options.plugins,
            title: { ...options.plugins.title, text: "Atividades física" },
          },
        }}
      />

      <Bar
        className="h-full max-h-60 w-full"
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
        className="h-full max-h-60 w-full"
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

export { AbsoluteGraphs };
