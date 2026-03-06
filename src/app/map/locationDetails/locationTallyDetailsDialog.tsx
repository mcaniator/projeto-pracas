import LocationTallyDetailsDialogContent from "@/app/map/locationDetails/locationTallyDetailsDialogContent";
import CDialog from "@/components/ui/dialog/cDialog";
import { usePublicFetchTallyDetails } from "@/lib/serverFunctions/apiCalls/public/tally";
import type { PublicFetchTallyDetailsResponse } from "@/lib/serverFunctions/queries/public/tally";
import { LinearProgress } from "@mui/material";
import { useEffect, useState } from "react";

const LocationTallyDetailsDialog = ({
  open,
  onClose,
  tallyId,
  locationName,
}: {
  open: boolean;
  onClose: () => void;
  tallyId: number | null;
  locationName: string;
}) => {
  const [selectedTallyDetails, setSelectedTallyDetails] =
    useState<PublicFetchTallyDetailsResponse | null>(null);
  const [hasDetailsRequestFinished, setHasDetailsRequestFinished] =
    useState(false);

  const [fetchTallyDetails, loadingTallyDetails] = usePublicFetchTallyDetails({
    callbacks: {
      onSuccess: (response) => {
        setSelectedTallyDetails(response.data ?? null);
        setHasDetailsRequestFinished(true);
      },
      onError: () => {
        setSelectedTallyDetails(null);
        setHasDetailsRequestFinished(true);
      },
      onCallFailed: () => {
        setSelectedTallyDetails(null);
        setHasDetailsRequestFinished(true);
      },
    },
  });

  useEffect(() => {
    if (!open || !tallyId) {
      setSelectedTallyDetails(null);
      setHasDetailsRequestFinished(false);
      return;
    }

    setSelectedTallyDetails(null);
    setHasDetailsRequestFinished(false);
    void fetchTallyDetails({ tallyId });
  }, [fetchTallyDetails, open, tallyId]);

  const dialogSubtitle = selectedTallyDetails?.locationName ?? locationName;

  return (
    <CDialog
      open={open}
      fullScreen
      disableDialogActions
      disableContentPadding
      title="Contagem de pessoas"
      subtitle={dialogSubtitle ?? "-"}
      onClose={onClose}
    >
      <div className="h-full min-h-0 overflow-hidden p-2 sm:p-3">
        {loadingTallyDetails || !hasDetailsRequestFinished ?
          <div className="flex w-full flex-col justify-center text-lg">
            <LinearProgress />
            Carregando...
          </div>
        : selectedTallyDetails?.tally ?
          <LocationTallyDetailsDialogContent
            key={selectedTallyDetails.tally.id}
            tally={selectedTallyDetails.tally}
          />
        : <div className="p-2 text-base text-gray-700">
            Não foi possível carregar os detalhes da contagem.
          </div>
        }
      </div>
    </CDialog>
  );
};

export default LocationTallyDetailsDialog;
