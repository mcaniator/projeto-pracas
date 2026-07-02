"use client";

import TableAssessmentComparison from "@/app/admin/map/assessmentsSidebar/tableAssessmentComparison";
import ResultViewerAssessmentComparison from "@/app/admin/map/assessmentsSidebar/resultViewerAssessmentComparison";
import CLinearProgress from "@/components/ui/CLinearProgress";
import CDialog from "@/components/ui/dialog/cDialog";
import { useFetchMapAssessmentComparisonAssessmentTrees } from "@/lib/serverFunctions/apiCalls/mapAssessmentComparison";
import {
  FetchMapAssessmentComparisonAssessmentTreesResponse,
  MapAssessmentComparisonLocation,
} from "@/lib/serverFunctions/queries/mapAssessmentComparison";
import { useMediaQuery, useTheme } from "@mui/material";
import { useEffect, useMemo, useState } from "react";

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
  const theme = useTheme();
  const isMobileView = useMediaQuery(theme.breakpoints.down("lg"));
  const [comparisonLocations, setComparisonLocations] = useState<
    FetchMapAssessmentComparisonAssessmentTreesResponse["locations"]
  >([]);
  const locationOrderById = useMemo(
    () =>
      new Map(
        locations.map((location, index) => [location.id, index] as const),
      ),
    [locations],
  );

  const locationIds = useMemo(
    () => locations.map((location) => location.id),
    [locations],
  );
  const [fetchAssessmentTrees, loadingAssessmentTrees] =
    useFetchMapAssessmentComparisonAssessmentTrees({
      callbacks: {
        onSuccess: (response) => {
          const nextLocations = [...(response.data?.locations ?? [])].sort(
            (a, b) =>
              (locationOrderById.get(a.id) ?? Number.MAX_SAFE_INTEGER) -
              (locationOrderById.get(b.id) ?? Number.MAX_SAFE_INTEGER),
          );

          setComparisonLocations(nextLocations);
        },
      },
    });

  useEffect(() => {
    if (!open || !category || locationIds.length === 0) {
      setComparisonLocations([]);
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
      fullScreen
      maxWidth="xl"
      disableDialogActions
    >
      {loadingAssessmentTrees ?
        <CLinearProgress label="Carregando..." />
      : isMobileView ?
        <ResultViewerAssessmentComparison
          locations={locations}
          comparisonLocations={comparisonLocations}
        />
      : <TableAssessmentComparison
          locations={locations}
          comparisonLocations={comparisonLocations}
        />
      }
    </CDialog>
  );
};

export default AssessmentComparisonDialog;
