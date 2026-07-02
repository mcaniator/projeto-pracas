"use client";

import AssessmentResultViewer from "@/components/ui/assessment/assessmentResultViewer";
import CAutocomplete from "@/components/ui/cAutoComplete";
import { dateFormatter } from "@/lib/formatters/dateFormatters";
import { FetchMapAssessmentComparisonAssessmentTreesResponse } from "@/lib/serverFunctions/queries/mapAssessmentComparison";
import { MapAssessmentComparisonLocation } from "@/lib/serverFunctions/queries/mapAssessmentComparisonUtils";
import { useMemo, useState } from "react";

type ComparisonLocation =
  FetchMapAssessmentComparisonAssessmentTreesResponse["locations"][number];

type ComparisonAssessmentTree = ComparisonLocation["assessmentTrees"][number];

const ResultViewerAssessmentComparison = ({
  locations,
  comparisonLocations,
}: {
  locations: MapAssessmentComparisonLocation[];
  comparisonLocations: FetchMapAssessmentComparisonAssessmentTreesResponse["locations"];
}) => {
  const [selectedLocationId, setSelectedLocationId] = useState<number | null>(
    null,
  );
  const [selectedAssessmentId, setSelectedAssessmentId] = useState<
    number | null
  >(null);

  const selectedLocation = useMemo<ComparisonLocation | null>(() => {
    return (
      comparisonLocations.find(
        (location) => location.id === selectedLocationId,
      ) ??
      comparisonLocations[0] ??
      null
    );
  }, [comparisonLocations, selectedLocationId]);

  const selectedAssessment = useMemo<ComparisonAssessmentTree | null>(() => {
    if (!selectedLocation) return null;

    return (
      selectedLocation.assessmentTrees.find(
        (assessment) => assessment.id === selectedAssessmentId,
      ) ??
      selectedLocation.assessmentTrees[0] ??
      null
    );
  }, [selectedAssessmentId, selectedLocation]);

  const assessmentWithLocation = useMemo(() => {
    if (!selectedAssessment || !selectedLocation) return null;

    return {
      ...selectedAssessment,
      location: {
        id: selectedLocation.id,
        name: selectedLocation.name,
        st_asgeojson:
          locations.find((location) => location.id === selectedLocation.id)
            ?.st_asgeojson ?? null,
      },
    };
  }, [locations, selectedAssessment, selectedLocation]);

  if (comparisonLocations.length === 0) {
    return (
      <div className="rounded border border-gray-200 p-4 text-sm text-gray-600">
        Nenhuma avaliação encontrada para os locais selecionados.
      </div>
    );
  }
  if (!selectedLocation) {
    throw new Error("Location not found");
  } else if (!selectedAssessment) {
    throw new Error("Assessment not found");
  }
  return (
    <div className="flex flex-col gap-3 overflow-auto pr-1">
      <div className="flex flex-col gap-2">
        <CAutocomplete
          label="Local"
          disableClearable
          options={comparisonLocations}
          value={selectedLocation}
          isOptionEqualToValue={(option, value) => option.id === value.id}
          getOptionLabel={(option) => option.name}
          onChange={(_, value) => {
            if (!value) return;

            setSelectedLocationId(value.id);
            setSelectedAssessmentId(value.assessmentTrees[0]?.id ?? null);
          }}
        />

        <CAutocomplete
          label="Avaliação"
          disableClearable
          options={selectedLocation?.assessmentTrees ?? []}
          value={selectedAssessment}
          isOptionEqualToValue={(option, value) => option.id === value.id}
          getOptionLabel={(option) =>
            dateFormatter.format(new Date(option.startDate))
          }
          onChange={(_, value) => {
            if (value) setSelectedAssessmentId(value.id);
          }}
        />
      </div>

      {assessmentWithLocation && (
        <div className="rounded border border-gray-200 bg-white p-3">
          <AssessmentResultViewer assessment={assessmentWithLocation} />
        </div>
      )}
    </div>
  );
};

export default ResultViewerAssessmentComparison;
