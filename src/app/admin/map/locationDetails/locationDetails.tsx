import LocationDeleteDialog from "@/app/admin/map/locationDeleteDialog";
import AssessmentHistory from "@/app/admin/map/locationDetails/assessmentHistory";
import LocationInfo from "@/app/admin/map/locationDetails/locationInfo";
import CImage from "@/components/ui/CImage";
import CButton from "@/components/ui/cButton";
import CToggleButtonGroup from "@/components/ui/cToggleButtonGroup";
import CDialog from "@/components/ui/dialog/cDialog";
import { FetchLocationsResponse } from "@/lib/serverFunctions/queries/location";
import { Divider } from "@mui/material";
import {
  IconExternalLink,
  IconPencil,
  IconTrash,
  IconX,
} from "@tabler/icons-react";
import Link from "next/link";
import { useEffect, useState } from "react";

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
  reloadLocations,
  enableLocationEdition,
}: {
  location: FetchLocationsResponse["locations"][number];
  closeLocationDetails: () => void;
  reloadLocations: () => void;
  isMobileView: boolean;
  enableLocationEdition: () => void;
}) => {
  const [detailsMode, setDetailsMode] = useState(detailsModes.DETAILS);
  const [openDeleteLocationDialog, setOpenDeleteLocationDialog] =
    useState(false);
  const [openMobileDialog, setOpenMobileDialog] = useState(isMobileView);

  useEffect(() => {
    setDetailsMode(detailsModes.DETAILS);
  }, [location]);

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
      <div className="flex justify-between">
        <div className="flex gap-1">
          <div className="flex items-center rounded-lg border border-gray-300 bg-gray-100 pl-1 text-sm">
            {location.assessmentCount} avaliações{" "}
            <Link href={`/admin/assessments?locationId=${location.id}`}>
              <CButton square dense variant="text">
                <IconExternalLink />
              </CButton>
            </Link>
          </div>
          <div className="flex items-center rounded-lg border border-gray-300 bg-gray-100 pl-1 text-sm">
            {location.tallyCount} contagens{" "}
            <Link href={`/admin/tallys?locationId=${location.id}`}>
              <CButton square dense variant="text">
                <IconExternalLink />
              </CButton>
            </Link>
          </div>
        </div>
        <div className="flex gap-1">
          <CButton
            onClick={() => {
              enableLocationEdition();
              setOpenMobileDialog(false);
            }}
            square
            dense
          >
            <IconPencil />
          </CButton>
          <CButton
            color="error"
            square
            dense
            onClick={() => {
              setOpenDeleteLocationDialog(true);
            }}
          >
            <IconTrash />
          </CButton>
        </div>
      </div>
      <Divider />
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
        <LocationInfo location={location} reloadLocations={reloadLocations} />
      </div>
      <div className={detailsMode === detailsModes.HISTORY ? "" : "hidden"}>
        <AssessmentHistory
          locationId={location.id}
          locationName={location.name}
        />
      </div>

      <LocationDeleteDialog
        location={location}
        open={openDeleteLocationDialog}
        onDeletionSuccess={() => {
          reloadLocations();
          closeLocationDetails();
        }}
        onClose={() => {
          setOpenDeleteLocationDialog(false);
        }}
      />
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
