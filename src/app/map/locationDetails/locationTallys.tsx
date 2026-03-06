import LocationTallyDetailsDialog from "@/app/map/locationDetails/locationTallyDetailsDialog";
import CButton from "@/components/ui/cButton";
import CIconChip from "@/components/ui/cIconChip";
import { dateTimeFormatter } from "@/lib/formatters/dateFormatters";
import { usePublicFetchTallys } from "@/lib/serverFunctions/apiCalls/public/tally";
import { PublicFetchLocationsResponse } from "@/lib/serverFunctions/queries/public/location";
import { PublicFetchTallysResponse } from "@/lib/serverFunctions/queries/public/tally";
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
  const [selectedTallyId, setSelectedTallyId] = useState<number | null>(null);

  const [fetchTallys, loadingTallys] = usePublicFetchTallys({
    callbacks: {
      onSuccess: (response) => {
        setTallys(response.data?.tallys ?? []);
      },
    },
  });

  const handleOpenTallyDetails = (tallyId: number) => {
    setSelectedTallyId(tallyId);
    setIsDetailsDialogOpen(true);
  };

  const handleCloseDetailsDialog = () => {
    setIsDetailsDialogOpen(false);
    setSelectedTallyId(null);
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

      <LocationTallyDetailsDialog
        open={isDetailsDialogOpen}
        onClose={handleCloseDetailsDialog}
        tallyId={selectedTallyId}
        locationName={location.name}
      />
    </div>
  );
};

export default LocationTallys;
