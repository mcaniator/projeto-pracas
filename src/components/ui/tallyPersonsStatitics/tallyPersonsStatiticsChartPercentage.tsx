"use client";

import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Tooltip,
} from "chart.js";
import CPersonCharacteristicGroupTypeChip from "@/components/ui/personCharacteristic/cPersonCharacteristicGroupTypeChip";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { useMemo } from "react";
import { Bar, Pie } from "react-chartjs-2";
import type { TallyPersonsStatiticsProps } from "./tallyPersonsStatiticsTypes";
import {
  getPercentageOfPeople,
  getQuantityByCharacteristicId,
  getTotalPeople,
} from "./tallyPersonsStatiticsUtils";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  ChartDataLabels,
);

const TallyPersonsStatiticsChartPercentage = ({
  tallyProtocolStructure,
  personObservations,
}: TallyPersonsStatiticsProps) => {
  const quantityByCharacteristicId = useMemo(
    () => getQuantityByCharacteristicId(personObservations),
    [personObservations],
  );
  const totalPeople = useMemo(
    () => getTotalPeople(personObservations),
    [personObservations],
  );

  return (
    <div className="flex w-full flex-col gap-3">
      {tallyProtocolStructure.tallyProtocolGroups.map((group) => {
        const characteristics = group.characteristics;
        const values = characteristics.map(
          ({ personCharacteristic }) =>
            quantityByCharacteristicId.get(personCharacteristic.id) ?? 0,
        );
        const colors = characteristics.map(
          ({ personCharacteristic }) => personCharacteristic.color,
        );
        const labels = characteristics.map(
          ({ personCharacteristic }) => personCharacteristic.name,
        );
        const isTagGroup = group.personCharacteristicGroup.isTagGroup;
        const chartHeight = Math.max(180, characteristics.length * 48 + 64);

        const dataLabelsOptions = {
          color: "black",
          font: { weight: "bold" as const },
          formatter: (value: number | string) => {
            const absoluteValue = Number(value);
            const percentage = getPercentageOfPeople(
              absoluteValue,
              totalPeople,
            );
            return `${absoluteValue} (${percentage.toFixed(1)}%)`;
          },
        };

        return (
          <section
            key={group.id}
            className="rounded border border-gray-300 bg-slate-50 p-2"
          >
            <h3 className="mb-2 flex items-center gap-2 text-lg font-semibold">
              {group.personCharacteristicGroup.title}
              <CPersonCharacteristicGroupTypeChip isTagGroup={isTagGroup} />
            </h3>
            <div style={{ height: isTagGroup ? chartHeight : 280 }}>
              {isTagGroup ?
                <Bar
                  data={{
                    labels,
                    datasets: [
                      {
                        data: values,
                        backgroundColor: colors,
                        borderColor: colors,
                        borderWidth: 1,
                      },
                    ],
                  }}
                  options={{
                    animation: false,
                    indexAxis: "y",
                    maintainAspectRatio: false,
                    responsive: true,
                    plugins: {
                      legend: { display: false },
                      datalabels: {
                        ...dataLabelsOptions,
                        anchor: "end",
                        align: "right",
                        clamp: true,
                      },
                    },
                    scales: {
                      x: {
                        beginAtZero: true,
                        grace: "10%",
                        ticks: { precision: 0 },
                      },
                      y: {
                        grid: { display: false },
                        ticks: { color: "black" },
                      },
                    },
                  }}
                />
              : <Pie
                  data={{
                    labels,
                    datasets: [
                      {
                        data: values,
                        backgroundColor: colors,
                        borderColor: colors,
                        borderWidth: 1,
                      },
                    ],
                  }}
                  options={{
                    animation: false,
                    maintainAspectRatio: false,
                    responsive: true,
                    plugins: {
                      legend: { position: "right" },
                      datalabels: {
                        ...dataLabelsOptions,
                        color: "white",
                        backgroundColor: "#333333",
                        borderRadius: 4,
                        padding: 4,
                      },
                    },
                  }}
                />}
            </div>
          </section>
        );
      })}
    </div>
  );
};

export default TallyPersonsStatiticsChartPercentage;
