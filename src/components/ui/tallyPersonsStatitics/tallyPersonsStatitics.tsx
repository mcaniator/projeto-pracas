"use client";

import CTabs from "@/components/ui/cTabs";
import { Tab } from "@mui/material";
import { useState } from "react";
import type { TallyPersonsStatiticsProps } from "./tallyPersonsStatiticsTypes";
import TallyPersonsStatiticsChart from "./tallyPersonsStatiticsChart";
import TallyPersonsStatiticsChartPercentage from "./tallyPersonsStatiticsChartPercentage";
import TallyPersonsStatiticsTables from "./tallyPersonsStatiticsTables";

export type {
  TallyPersonsStatiticsObservation,
  TallyPersonsStatiticsProps,
  TallyPersonsStatiticsStructure,
} from "./tallyPersonsStatiticsTypes";

type TallyPersonsStatiticsTab = "charts" | "chartsPercentage" | "tables";

const TallyPersonsStatitics = (props: TallyPersonsStatiticsProps) => {
  const [selectedTab, setSelectedTab] =
    useState<TallyPersonsStatiticsTab>("charts");

  return (
    <div className="flex h-full min-h-0 flex-col">
      <CTabs
        value={selectedTab}
        onChange={(_, value: TallyPersonsStatiticsTab) =>
          setSelectedTab(value)
        }
        aria-label="Estatísticas de pessoas"
      >
        <Tab value="charts" label="Gráficos" />
        <Tab value="chartsPercentage" label="Gráficos (%)" />
        <Tab value="tables" label="Tabelas" />
      </CTabs>

      <div className="min-h-0 flex-1 overflow-auto pt-2">
        {selectedTab === "charts" && <TallyPersonsStatiticsChart {...props} />}
        {selectedTab === "chartsPercentage" && (
          <TallyPersonsStatiticsChartPercentage {...props} />
        )}
        {selectedTab === "tables" && <TallyPersonsStatiticsTables {...props} />}
      </div>
    </div>
  );
};

export default TallyPersonsStatitics;
