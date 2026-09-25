"use client";

import ResultViewerAssessmentComparison from "@/app/admin/map/assessmentsSidebar/resultViewerAssessmentComparison";
import TableAssessmentComparison from "@/app/admin/map/assessmentsSidebar/tableAssessmentComparison";
import CLinearProgress from "@/components/ui/CLinearProgress";
import CDialog from "@/components/ui/dialog/cDialog";
import { useFetchMapAssessmentComparisonAssessmentDetails } from "@/lib/serverFunctions/apiCalls/mapAssessmentComparison";
import {
  FetchMapAssessmentComparisonAssessmentDetailsResponse,
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
    FetchMapAssessmentComparisonAssessmentDetailsResponse["locations"]
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
  const [fetchAssessmentDetails, loadingAssessmentDetails] =
    useFetchMapAssessmentComparisonAssessmentDetails({
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

    void fetchAssessmentDetails({
      params: {
        categoryId: category.id,
        locationIds,
      },
    });
  }, [category, fetchAssessmentDetails, locationIds, open]);
  return (
    <CDialog
      title={category?.name ?? "Avaliações"}
      open={open}
      onClose={onClose}
      fullScreen
      maxWidth="xl"
      disableDialogActions
    >
      {loadingAssessmentDetails ?
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
