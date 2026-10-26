"use client";

import CTabs from "@/components/ui/cTabs";
import FormSubmissionViewer from "@/components/ui/formSubmissionViewer/formSubmissionViewer";
import type {
  GetTallySubmissionDataResult,
  TallyLocationPolygon,
} from "@/lib/serverFunctions/queries/tally";
import { Tab } from "@mui/material";
import { useState } from "react";

import TallyPersonsStatiticsWithFilter from "./tallyPersonsStatiticsWithFilter";

const TallyViewer = ({
  tallySubmission,
  locationPolygon,
}: {
  tallySubmission: GetTallySubmissionDataResult;
  locationPolygon: TallyLocationPolygon;
}) => {
  const { formSubmission, tallyProtocolStructure, personObservations } =
    tallySubmission;
  const [selectedTab, setSelectedTab] = useState<"form" | "persons">(
    formSubmission ? "form" : "persons",
  );

  return (
    <div className="flex h-full min-h-0 flex-col">
      <CTabs
        value={selectedTab}
        onChange={(_, value: "form" | "persons") => setSelectedTab(value)}
        aria-label="Visualização da contagem"
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
            tallyProtocolStructure={tallyProtocolStructure}
            personObservations={personObservations}
          />
        }
      </div>
    </div>
  );
};

export default TallyViewer;
