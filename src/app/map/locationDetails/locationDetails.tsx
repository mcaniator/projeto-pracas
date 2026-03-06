import LocationInfo from "@/app/map/locationDetails/locationInfo";
import LocationTallys from "@/app/map/locationDetails/locationTallys";
import CImage from "@/components/ui/CImage";
import CButton from "@/components/ui/cButton";
import CToggleButtonGroup from "@/components/ui/cToggleButtonGroup";
import CDialog from "@/components/ui/dialog/cDialog";
import { PublicFetchLocationsResponse } from "@/lib/serverFunctions/queries/public/location";
import { Divider } from "@mui/material";
import { IconInfoCircle, IconX } from "@tabler/icons-react";
import { ReactNode, useState } from "react";
import { IoIosPeople } from "react-icons/io";

type LocationDetailsOption = "INFO" | "PERSONS";

const detailsOptions: {
  id: LocationDetailsOption;
  label: string;
  icon: ReactNode;
}[] = [
  {
    id: "INFO",
    label: "Informações",
    icon: <IconInfoCircle />,
  },
  {
    id: "PERSONS",
    label: "Pessoas",
    icon: <IoIosPeople size={24} />,
  },
];

const LocationDetails = ({
  location,
  isMobileView,
  closeLocationDetails,
}: {
  location: PublicFetchLocationsResponse["locations"][number];
  closeLocationDetails: () => void;
  isMobileView: boolean;
}) => {
  const [openMobileDialog, setOpenMobileDialog] = useState(isMobileView);
  const [detailsOption, setDetailsOption] =
    useState<LocationDetailsOption>("INFO");
  const inner = (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between">
        {!isMobileView && (
          <div className="flex flex-col">
            <h3 className="text-xl font-semibold">{location.name}</h3>
            <h3 className="text-xl text-gray-500">{location.popularName}</h3>
          </div>
        )}

        {!isMobileView && (
          <CButton square variant="text" onClick={closeLocationDetails}>
            <IconX />
          </CButton>
        )}
      </div>
      <CImage
        src={location.mainImage}
        alt={location.name}
        width={384}
        height={200}
      />
      <div className="flex gap-1">
        <CToggleButtonGroup
          options={detailsOptions}
          value={detailsOption}
          getLabel={(o) => {
            return (
              <>
                {o.icon} {o.label}
              </>
            );
          }}
          getValue={(o) => o.id}
          onChange={(_, v) => {
            setDetailsOption(v.id);
          }}
        />
      </div>

      <Divider />

      {detailsOption === "INFO" && <LocationInfo location={location} />}
      {detailsOption === "PERSONS" && <LocationTallys location={location} />}
    </div>
  );
  if (isMobileView) {
    return (
      <CDialog
        fullScreen
        open={openMobileDialog}
        disableBackdropClose //This is needed because if a polygon is selected in a touchscreen, the dialog will detect the touch as a brackdrop touch, closing the dialog immediately
        title={location.name}
        subtitle={location.popularName ?? undefined}
        onClose={() => {
          setOpenMobileDialog(false);
          setTimeout(() => {
            closeLocationDetails();
          }, 150);
        }}
      >
        {inner}
      </CDialog>
    );
  } else {
    return (
      <div
        className="flex h-full w-96 flex-col gap-1 overflow-auto rounded-xl bg-white px-2 py-1 text-black"
        style={{ boxShadow: "0px 0px 10px 5px rgba(0, 0, 0, 0.1)" }}
      >
        {inner}
      </div>
    );
  }
};

export default LocationDetails;
