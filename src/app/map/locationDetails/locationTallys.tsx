import LocationTallyDetailsDialogContent from "@/app/map/locationDetails/locationTallyDetailsDialogContent";
import CButton from "@/components/ui/cButton";
import CIconChip from "@/components/ui/cIconChip";
import CDialog from "@/components/ui/dialog/cDialog";
import { dateTimeFormatter } from "@/lib/formatters/dateFormatters";
import {
  usePublicFetchTallyDetails,
  usePublicFetchTallys,
} from "@/lib/serverFunctions/apiCalls/public/tally";
import { PublicFetchLocationsResponse } from "@/lib/serverFunctions/queries/public/location";
import {
  PublicFetchTallyDetailsResponse,
  PublicFetchTallysResponse,
} from "@/lib/serverFunctions/queries/public/tally";
import { Divider, LinearProgress } from "@mui/material";
import { IconCalendar, IconExternalLink } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { Virtuoso } from "react-virtuoso";

const LocationTallys = ({
  location,
}: {
  location: PublicFetchLocationsResponse["locations"][number];
}) => {
  const [tallys, setTallys] = useState<PublicFetchTallysResponse["tallys"]>([]);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [selectedTallyDetails, setSelectedTallyDetails] =
    useState<PublicFetchTallyDetailsResponse | null>(null);
  const [hasDetailsRequestFinished, setHasDetailsRequestFinished] =
    useState(false);

  const [fetchTallys, loadingTallys] = usePublicFetchTallys({
    callbacks: {
      onSuccess: (response) => {
        setTallys(response.data?.tallys ?? []);
      },
    },
  });

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

  const handleOpenTallyDetails = (tallyId: number) => {
    setIsDetailsDialogOpen(true);
    setSelectedTallyDetails(null);
    setHasDetailsRequestFinished(false);
    void fetchTallyDetails({ tallyId });
  };

  const handleCloseDetailsDialog = () => {
    setIsDetailsDialogOpen(false);
    setSelectedTallyDetails(null);
    setHasDetailsRequestFinished(false);
  };

  useEffect(() => {
    void fetchTallys({
      locationId: location.id,
    });
  }, [fetchTallys, location]);
  return (
    <div className="flex flex-col gap-1">
      <h4 className="font-semibold">Contagens</h4>
      <Divider />
      {loadingTallys ?
        <div className="flex w-full flex-col justify-center text-lg">
          <LinearProgress />
          Carregando...
        </div>
      : <Virtuoso
          data={tallys}
          style={{ height: "100%", overflowX: "hidden", minHeight: "300px" }}
          itemContent={(_, a) => {
            return (
              <div className="pb-4" key={a.id}>
                <div
                  key={a.id}
                  className="flex flex-row justify-between bg-gray-200 p-2 px-2 shadow-xl"
                >
                  <div className="flex h-auto w-full flex-col gap-1">
                    <span className="flex items-center text-base sm:text-xl">
                      <CIconChip
                        icon={<IconCalendar />}
                        tooltip={a.endDate ? "Início - Fim" : "Início"}
                      />
                      <div className="flex flex-col">
                        <span>{`${dateTimeFormatter.format(new Date(a.startDate))} `}</span>
                        <span>{`${a.endDate ? `${dateTimeFormatter.format(new Date(a.endDate))}` : ""}`}</span>
                      </div>
                    </span>
                    <Divider />
                    <span className="flex items-center gap-2 text-base sm:text-xl">
                      <CButton
                        square
                        onClick={() => handleOpenTallyDetails(a.id)}
                      >
                        <IconExternalLink />
                        Acessar
                      </CButton>
                    </span>
                  </div>
                </div>
              </div>
            );
          }}
        />
      }

      <CDialog
        open={isDetailsDialogOpen}
        fullScreen
        disableDialogActions
        disableContentPadding
        title="Detalhes da contagem"
        onClose={handleCloseDetailsDialog}
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
              locationName={selectedTallyDetails.locationName}
            />
          : <div className="p-2 text-base text-gray-700">
              Não foi possível carregar os detalhes da contagem.
            </div>
          }
        </div>
      </CDialog>
    </div>
  );
};

export default LocationTallys;
