"use client";

import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  LinearScale,
  Tooltip,
} from "chart.js";
import CPersonCharacteristicGroupTypeChip from "@/components/ui/personCharacteristic/cPersonCharacteristicGroupTypeChip";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { useMemo } from "react";
import { Bar } from "react-chartjs-2";
import type { TallyPersonsStatiticsProps } from "./tallyPersonsStatiticsTypes";
import { getQuantityByCharacteristicId } from "./tallyPersonsStatiticsUtils";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  ChartDataLabels,
);

const TallyPersonsStatiticsChart = ({
  modularTallyTemplateStructure,
  personObservations,
}: TallyPersonsStatiticsProps) => {
  const quantityByCharacteristicId = useMemo(
    () => getQuantityByCharacteristicId(personObservations),
    [personObservations],
  );

  return (
    <div className="flex w-full flex-col gap-3">
      {modularTallyTemplateStructure.tallyTemplateGroups.map((group) => {
        const characteristics = group.characteristics;
        const chartHeight = Math.max(180, characteristics.length * 48 + 64);

        return (
          <section
            key={group.id}
            className="rounded border border-gray-300 bg-slate-50 p-2"
          >
            <h3 className="mb-2 flex items-center gap-2 text-lg font-semibold">
              {group.personCharacteristicGroup.title}
              <CPersonCharacteristicGroupTypeChip
                isTagGroup={group.personCharacteristicGroup.isTagGroup}
              />
            </h3>
            <div style={{ height: chartHeight }}>
              <Bar
                data={{
                  labels: characteristics.map(
                    ({ personCharacteristic }) => personCharacteristic.name,
                  ),
                  datasets: [
                    {
                      data: characteristics.map(
                        ({ personCharacteristic }) =>
                          quantityByCharacteristicId.get(
                            personCharacteristic.id,
                          ) ?? 0,
                      ),
                      backgroundColor: characteristics.map(
                        ({ personCharacteristic }) =>
                          personCharacteristic.color,
                      ),
                      borderColor: characteristics.map(
                        ({ personCharacteristic }) =>
                          personCharacteristic.color,
                      ),
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
                      anchor: "end",
                      align: "right",
                      clamp: true,
                      color: "black",
                      font: { weight: "bold" },
                      formatter: (value) => String(value),
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
            </div>
          </section>
        );
      })}
    </div>
  );
};

export default TallyPersonsStatiticsChart;
