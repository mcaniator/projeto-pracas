"use client";

import CTabs from "@/components/ui/cTabs";
import FormSubmissionViewer from "@/components/ui/formSubmissionViewer/formSubmissionViewer";
import type {
  GetModularTallySubmissionDataResult,
  ModularTallyLocationPolygon,
} from "@/lib/serverFunctions/queries/modularTally";
import { Tab } from "@mui/material";
import { useState } from "react";

import TallyPersonsStatiticsWithFilter from "./tallyPersonsStatiticsWithFilter";

const ModularTallyViewer = ({
  modularTallySubmission,
  locationPolygon,
}: {
  modularTallySubmission: GetModularTallySubmissionDataResult;
  locationPolygon: ModularTallyLocationPolygon;
}) => {
  const { formSubmission, modularTallyTemplateStructure, personObservations } =
    modularTallySubmission;
  const [selectedTab, setSelectedTab] = useState<"form" | "persons">(
    formSubmission ? "form" : "persons",
  );

  return (
    <div className="flex h-full min-h-0 flex-col">
      <CTabs
        value={selectedTab}
        onChange={(_, value: "form" | "persons") => setSelectedTab(value)}
        aria-label="Visualização da contagem modular"
      >
        {formSubmission && <Tab value="form" label="Formulário" />}
        <Tab value="persons" label="Pessoas" />
      </CTabs>

      <div className="mt-1 min-h-0 flex-1">
        {selectedTab === "form" && formSubmission ?
          <div className="h-full overflow-auto">
            <FormSubmissionViewer
              formSubmission={formSubmission}
              locationPolygonGeoJson={locationPolygon.st_asgeojson}
            />
          </div>
        : <TallyPersonsStatiticsWithFilter
            modularTallyTemplateStructure={modularTallyTemplateStructure}
            personObservations={personObservations}
          />
        }
      </div>
    </div>
  );
};

export default ModularTallyViewer;
