import AssessmentHistory from "@/app/map/locationDetails/assessmentHistory";
import LocationInfo from "@/app/map/locationDetails/locationInfo";
import CImage from "@/components/ui/CImage";
import CButton from "@/components/ui/cButton";
import CToggleButtonGroup from "@/components/ui/cToggleButtonGroup";
import CDialog from "@/components/ui/dialog/cDialog";
import { PublicFetchLocationsResponse } from "@/lib/serverFunctions/queries/public/location";
import { Divider } from "@mui/material";
import { IconX } from "@tabler/icons-react";
import { useState } from "react";

const detailsModes = {
  DETAILS: 0,
  HISTORY: 1,
};

const detailsModeOptions = [
  { label: "Detalhes", value: detailsModes.DETAILS },
  { label: "Histórico", value: detailsModes.HISTORY },
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
  const [detailsMode, setDetailsMode] = useState(detailsModes.DETAILS);
  const [openMobileDialog, setOpenMobileDialog] = useState(isMobileView);
  const inner = (
    <div className="flex h-full flex-col gap-1">
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
      {!isMobileView && <Divider />}
      <div className="flex h-full flex-col gap-1 overflow-auto">
        {detailsMode === detailsModes.DETAILS && (
          <>
            <div className="flex justify-center">
              <CImage
                src={location.mainImage}
                alt={location.name}
                width={384}
                height={200}
              />
            </div>
            <Divider />
          </>
        )}

        {location.latestAssessmentId && (
          <CToggleButtonGroup
            options={detailsModeOptions}
            value={detailsMode}
            getLabel={(o) => o.label}
            getValue={(o) => o.value}
            onChange={(_, v) => {
              setDetailsMode(v.value);
            }}
          />
        )}

        <div className={detailsMode === detailsModes.DETAILS ? "" : "hidden"}>
          <LocationInfo location={location} />
        </div>
        <div
          className={
            detailsMode === detailsModes.HISTORY ? "min-h-0 flex-1" : "hidden"
          }
        >
          <AssessmentHistory
            locationId={location.id}
            locationName={location.name}
          />
        </div>
      </div>
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
