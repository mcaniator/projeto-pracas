import CIconChip from "@/components/ui/cIconChip";
import { PublicFetchLocationsResponse } from "@/lib/serverFunctions/queries/public/location";
import { Breadcrumbs, Divider } from "@mui/material";
import { IconBuildingCommunity } from "@tabler/icons-react";

import { FetchLocationsResponse } from "../../../lib/serverFunctions/queries/location";

const CLocationAdministrativeUnits = ({
  location,
  topDivider,
}: {
  topDivider?: boolean;
  location:
    | FetchLocationsResponse["locations"][number]
    | PublicFetchLocationsResponse["locations"][number];
}) => {
  if (
    !location.broadAdministrativeUnitTitle &&
    !location.intermediateAdministrativeUnitTitle &&
    !location.narrowAdministrativeUnitTitle
  )
    return null;
  return (
    <>
      {topDivider && <Divider />}
      <div className="flex items-center">
        <CIconChip
          icon={<IconBuildingCommunity />}
          tooltip={[
            location.broadAdministrativeUnitTitle,
            location.intermediateAdministrativeUnitTitle,
            location.narrowAdministrativeUnitTitle,
          ]
            .filter(Boolean)
            .join(" > ")}
        />
        <Breadcrumbs separator="›" aria-label="breadcrumb">
          {!!location.broadAdministrativeUnitTitle &&
            (location.broadAdministrativeUnitName ?
              <div>{location.broadAdministrativeUnitName}</div>
            : <span>-</span>)}
          {!!location.intermediateAdministrativeUnitTitle &&
            (location.intermediateAdministrativeUnitName ?
              <div>{location.intermediateAdministrativeUnitName}</div>
            : <span>-</span>)}
          {!!location.narrowAdministrativeUnitTitle &&
            (location.narrowAdministrativeUnitName ?
              <div>{location.narrowAdministrativeUnitName}</div>
            : <span className="ml-1">-</span>)}
        </Breadcrumbs>
      </div>
    </>
  );
};

export default CLocationAdministrativeUnits;
