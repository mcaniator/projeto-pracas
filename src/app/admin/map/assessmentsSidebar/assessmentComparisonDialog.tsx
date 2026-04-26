"use client";

import CLinearProgress from "@/components/ui/CLinearProgress";
import CAccordion from "@/components/ui/accordion/CAccordion";
import CAccordionDetails from "@/components/ui/accordion/CAccordionDetails";
import CAccordionSummary from "@/components/ui/accordion/CAccordionSummary";
import CAssessmentResultViewer from "@/components/ui/assessment/assessmentResultViewer";
import CAutocomplete from "@/components/ui/cAutoComplete";
import CDialog from "@/components/ui/dialog/cDialog";
import { dateFormatter } from "@/lib/formatters/dateFormatters";
import { useFetchMapAssessmentComparisonAssessmentTrees } from "@/lib/serverFunctions/apiCalls/mapAssessmentComparison";
import {
  FetchMapAssessmentComparisonAssessmentTreesResponse,
  MapAssessmentComparisonLocation,
} from "@/lib/serverFunctions/queries/mapAssessmentComparison";
import { Chip } from "@mui/material";
import { IconCalendar, IconChartBar } from "@tabler/icons-react";
import { useEffect, useMemo, useState } from "react";

const AssessmentComparisonDialogItem = ({
  location,
  onAssessmentChange,
  selectedAssessmentId,
}: {
  location: FetchMapAssessmentComparisonAssessmentTreesResponse["locations"][number];
  onAssessmentChange: (assessmentId: number) => void;
  selectedAssessmentId: number | null;
}) => {
  const selectedAssessment =
    location.assessmentTrees.find(
      (assessment) => assessment.id === selectedAssessmentId,
    ) ??
    location.assessmentTrees[0] ??
    null;

  return (
    <CAccordion defaultExpanded>
      <CAccordionSummary>
        <div className="flex flex-wrap items-center gap-2">
          <IconChartBar />
          <span className="font-semibold">{location.name}</span>
          {selectedAssessment && (
            <Chip
              size="small"
              icon={<IconCalendar />}
              label={dateFormatter.format(
                new Date(selectedAssessment.startDate),
              )}
            />
          )}
        </div>
      </CAccordionSummary>
      <CAccordionDetails>
        <div className="flex flex-col gap-2">
          {selectedAssessment && (
            <>
              <CAutocomplete
                label="Avaliação"
                disableClearable
                options={location.assessmentTrees}
                value={selectedAssessment}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                getOptionLabel={(option) =>
                  dateFormatter.format(new Date(option.startDate))
                }
                onChange={(_, value) => onAssessmentChange(value.id)}
              />
              <CAssessmentResultViewer assessment={selectedAssessment} />
            </>
          )}
        </div>
      </CAccordionDetails>
    </CAccordion>
  );
};

const AssessmentComparisonDialog = ({
  category,
  locations,
  onClose,
  open,
}: {
  category: { id: number; name: string } | null;
  locations: MapAssessmentComparisonLocation[];
  onClose: () => void;
  open: boolean;
}) => {
  const [comparisonLocations, setComparisonLocations] = useState<
    FetchMapAssessmentComparisonAssessmentTreesResponse["locations"]
  >([]);
  const [selectedAssessmentIds, setSelectedAssessmentIds] = useState<
    Record<number, number>
  >({});

  const [fetchAssessmentTrees, loadingAssessmentTrees] =
    useFetchMapAssessmentComparisonAssessmentTrees({
      callbacks: {
        onSuccess: (response) => {
          const nextLocations = response.data?.locations ?? [];
          setComparisonLocations(nextLocations);
          setSelectedAssessmentIds(
            Object.fromEntries(
              nextLocations
                .map(
                  (location) =>
                    [location.id, location.assessmentTrees[0]?.id] as const,
                )
                .filter(
                  (entry): entry is readonly [number, number] => !!entry[1],
                ),
            ),
          );
        },
      },
    });

  const locationIds = useMemo(
    () => locations.map((location) => location.id),
    [locations],
  );

  useEffect(() => {
    if (!open || !category || locationIds.length === 0) {
      setComparisonLocations([]);
      setSelectedAssessmentIds({});
      return;
    }

    void fetchAssessmentTrees({
      categoryId: category.id,
      locationIds,
    });
  }, [category, fetchAssessmentTrees, locationIds, open]);

  return (
    <CDialog
      title={category?.name ?? "Avaliações"}
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="xl"
      disableDialogActions
    >
      <div className="flex max-h-[75vh] flex-col gap-2 overflow-auto pr-1">
        {loadingAssessmentTrees && <CLinearProgress label="Carregando..." />}
        {!loadingAssessmentTrees &&
          comparisonLocations.map((location) => (
            <AssessmentComparisonDialogItem
              key={location.id}
              location={location}
              selectedAssessmentId={selectedAssessmentIds[location.id] ?? null}
              onAssessmentChange={(assessmentId) => {
                setSelectedAssessmentIds((prev) => ({
                  ...prev,
                  [location.id]: assessmentId,
                }));
              }}
            />
          ))}
      </div>
    </CDialog>
  );
};

export default AssessmentComparisonDialog;
