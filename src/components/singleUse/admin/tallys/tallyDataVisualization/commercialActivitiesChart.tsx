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

import { TallyInfoAndCommercialActivitiesObject } from "./mainTallyDataTableComplementary";

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
  tallyWithCommercialActivities,
}: {
  tallyWithCommercialActivities: Map<
    number,
    TallyInfoAndCommercialActivitiesObject
  >;
}) => {
  const commercialActivitiesNames: string[] = [];
  let totalCommercialActivities = 0;
  const commercialActivitiesWithTotalOccurrences = new Map<string, number>();
  tallyWithCommercialActivities.forEach((tally) => {
    if (
      tally.commercialActivities &&
      Object.keys(tally.commercialActivities).length > 0
    ) {
      Object.entries(tally.commercialActivities).forEach(([key, value]) => {
        if (value) {
          const previousValue =
            commercialActivitiesWithTotalOccurrences.get(key) || 0;
          commercialActivitiesWithTotalOccurrences.set(
            key,
            previousValue + value,
          );
          totalCommercialActivities += value;
          if (value !== 0 && !commercialActivitiesNames.includes(key)) {
            commercialActivitiesNames.push(key);
          }
        }
      });
    }
  });
  commercialActivitiesNames.sort();
  const commercialActivitiesArray = Array.from(
    commercialActivitiesWithTotalOccurrences,
  );
  commercialActivitiesArray.sort((a, b) => a[0].localeCompare(b[0]));
  const sorrtedOccurrences = commercialActivitiesArray.map(
    (activity) => activity[1],
  );
  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
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
          precision: 0,
        },
        grid: {
          color: "white",
        },
      },
      y: {
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

  const commercialActivitiesData = {
    labels: commercialActivitiesNames,
    datasets: [
      {
        data: sorrtedOccurrences,
        backgroundColor: "rgb(148,0,211)",
        borderColor: "rgb(153,50,204)",
        borderWidth: 1,
      },
    ],
  };
  return (
    <Bar
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
