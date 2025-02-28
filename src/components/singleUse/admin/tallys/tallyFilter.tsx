"use client";

import { Button } from "@/components/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  exportDailyTallysFromSingleLocation,
  exportIndividualTallysToCSV,
} from "@/serverActions/exportToCSV";
import Link from "next/link";
import React, { useState } from "react";

import { TallyDataFetchedToTallyList } from "./tallyListPage";

const TallyFilter = ({
  locationId,
  locationName,
  activeTallys,
  handleWeekdayChange,
  handleInitialDateChange,
  handleFinalDateChange,
}: {
  locationId: number;
  locationName: string;
  activeTallys: TallyDataFetchedToTallyList[] | undefined;
  handleInitialDateChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleFinalDateChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleWeekdayChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) => {
  const [loadingExport, setLoadingExport] = useState({
    individual: false,
    added: false,
  });

  const handleTallysExport = async (addedContent: boolean) => {
    const tallysIds = activeTallys?.map((tally) => tally.id);
    if (!tallysIds || tallysIds.length === 0) return;

    let csvString = "";
    if (addedContent) {
      setLoadingExport({ individual: false, added: true });
      csvString = await exportDailyTallysFromSingleLocation(tallysIds);
    } else {
      setLoadingExport({ individual: true, added: false });
      csvString = await exportIndividualTallysToCSV(tallysIds);
    }

    const blob = new Blob([csvString]);
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      (addedContent ? `Contagens diárias ` : `Contagens Individuais `) +
        `${locationName}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setLoadingExport({ individual: false, added: false });
  };

  let activeTallysIdsString;
  if (activeTallys)
    activeTallysIdsString = `${activeTallys.map((tally) => tally.id).join("-")}`;

  return (
    <div className="w-full max-w-full">
      <h4 className="mb-4 text-2xl font-semibold">Filtros</h4>
      <div className="flex flex-col space-y-6">
        {/* Date Filter */}
        <div className="w-full">
          <h5 className="mb-3 text-xl font-semibold">Filtro por data</h5>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="flex flex-col items-center space-y-2 sm:flex-row sm:space-x-2 sm:space-y-0">
              <label
                htmlFor="initial-date"
                className="w-full sm:mr-2 sm:w-auto"
              >
                De:
              </label>
              <Input
                id="initial-date"
                type="datetime-local"
                className="w-full"
                onChange={handleInitialDateChange}
              />
            </div>

            <div className="flex flex-col items-center space-y-2 sm:flex-row sm:space-x-2 sm:space-y-0">
              <label htmlFor="final-date" className="w-full sm:mr-2 sm:w-auto">
                A:
              </label>
              <Input
                id="final-date"
                type="datetime-local"
                className="w-full"
                onChange={handleFinalDateChange}
              />
            </div>
          </div>
        </div>

        {/* Weekday Filter */}
        <div className="w-full">
          <h5 className="mb-3 text-xl font-semibold">
            Filtro por dia da semana
          </h5>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-7">
            {[
              { id: "sun", label: "Dom." },
              { id: "mon", label: "Seg." },
              { id: "tue", label: "Ter." },
              { id: "wed", label: "Qua." },
              { id: "thu", label: "Qui." },
              { id: "fri", label: "Sex." },
              { id: "sat", label: "Sáb." },
            ].map(({ id, label }) => (
              <div key={id} className="flex items-center justify-center">
                <Checkbox
                  id={id}
                  value={label.toLowerCase()}
                  onChange={handleWeekdayChange}
                />
                <label htmlFor={id} className="ml-1 text-sm">
                  {label}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Export Buttons */}
        <div className="w-full">
          <h5 className="mb-3 text-xl font-semibold">Contagens Filtradas</h5>
          <div className="flex flex-col gap-4 sm:flex-wrap">
            <Button className="whitespace-nowrap">
              <Link
                href={`/admin/parks/${locationId}/tallys/dataVisualization/${activeTallysIdsString}`}
              >
                Dados somados
              </Link>
            </Button>
            <Button
              className="whitespace-nowrap"
              onPress={() => {
                handleTallysExport(false).catch(() => ({ statusCode: 1 }));
              }}
            >
              {loadingExport.individual ?
                "Exportando..."
              : "Exportar individualmente"}
            </Button>
            <Button
              className="whitespace-nowrap"
              onPress={() => {
                handleTallysExport(true).catch(() => ({ statusCode: 1 }));
              }}
            >
              {loadingExport.added ?
                "Exportando"
              : "Exportar contagens por dia"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export { TallyFilter };
