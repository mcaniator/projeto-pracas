"use client";

import { Button } from "@/components/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  exportDailyTallys,
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
      csvString = await exportDailyTallys(tallysIds, ["name", "id", "date"]);
    } else {
      setLoadingExport({ individual: true, added: false });
      csvString = await exportIndividualTallysToCSV(tallysIds, [
        "name",
        "id",
        "date",
      ]);
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
    <React.Fragment>
      <h4 className={"text-2xl font-semibold"}>Filtros</h4>
      <div className="flex flex-col gap-5">
        <div className="flex basis-1/5 flex-col">
          <h5 className="text-xl font-semibold">Filtro por data</h5>
          <div className="flex-cols-2 flex gap-6">
            <div className="flex flex-row items-center">
              <label htmlFor="initial-date" className="mr-2">
                De:
              </label>
              <Input
                id="initial-date"
                type="datetime-local"
                onChange={handleInitialDateChange}
              ></Input>
            </div>

            <div className="flex flex-row items-center">
              <label htmlFor="final-date" className="mr-2">
                A:
              </label>
              <Input
                id="final-date"
                type="datetime-local"
                onChange={handleFinalDateChange}
              ></Input>
            </div>
          </div>
        </div>
        <div className="flex basis-1/5 flex-col">
          <h5 className="text-xl font-semibold">Filtro por dia da semana</h5>
          <div className="flex gap-4">
            <div className="flex">
              <label htmlFor="sun" className="mr-1">
                Dom.
              </label>
              <Checkbox
                id="sun"
                value={"dom."}
                variant={"default"}
                onChange={handleWeekdayChange}
              />
            </div>
            <div className="flex">
              <label htmlFor="mon" className="mr-1">
                Seg.
              </label>
              <Checkbox
                id="mon"
                value={"seg."}
                onChange={handleWeekdayChange}
              />
            </div>

            <div className="flex">
              <label htmlFor="tue" className="mr-1">
                Ter.
              </label>
              <Checkbox
                id="tue"
                value={"ter."}
                onChange={handleWeekdayChange}
              />
            </div>

            <div className="flex">
              <label htmlFor="wed" className="mr-1">
                Qua.
              </label>
              <Checkbox
                id="wed"
                value={"qua."}
                onChange={handleWeekdayChange}
              />
            </div>

            <div className="flex">
              <label htmlFor="thu" className="mr-1">
                Qui.
              </label>
              <Checkbox
                id="thu"
                value={"qui."}
                onChange={handleWeekdayChange}
              />
            </div>

            <div className="flex">
              <label htmlFor="fri" className="mr-1">
                Sex.
              </label>
              <Checkbox
                id="fri"
                value={"sex."}
                onChange={handleWeekdayChange}
              />
            </div>

            <div className="flex">
              <label htmlFor="sat" className="mr-1">
                Sáb.
              </label>
              <Checkbox
                id="sat"
                value={"sáb."}
                onChange={handleWeekdayChange}
              />
            </div>
          </div>
        </div>
        <div className="flex basis-1/5 flex-col">
          <h5 className="text-xl font-semibold">Contagens Filtradas</h5>
          <div className="flex flex-col gap-1">
            <div className="flex flex-row gap-3">
              <div>
                <Button>
                  <Link
                    href={`/admin/parks/${locationId}/tallys/dataVisualization/${activeTallysIdsString}`}
                  >
                    Dados somados
                  </Link>
                </Button>
              </div>
              <div>
                <Button
                  onPress={() => {
                    handleTallysExport(false).catch(() => ({ statusCode: 1 }));
                  }}
                >
                  {loadingExport.individual ?
                    "Exportando..."
                  : "Exportar individualmente"}
                </Button>
              </div>
            </div>
            <div>
              <Button
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
    </React.Fragment>
  );
};

export { TallyFilter };
