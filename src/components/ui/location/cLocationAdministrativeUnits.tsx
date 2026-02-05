import CIconChip from "@/components/ui/cIconChip";
import { Breadcrumbs } from "@mui/material";
import { IconBuildingCommunity } from "@tabler/icons-react";

import { FetchLocationsResponse } from "../../../lib/serverFunctions/queries/location";

const CLocationAdministrativeUnits = ({
  location,
}: {
  location: FetchLocationsResponse["locations"][number];
}) => {
  return (
    <div className="flex items-center">
      <CIconChip
        icon={<IconBuildingCommunity />}
        tooltip={`${location.broadAdministrativeUnitTitle}${location.intermediateAdministrativeUnitTitle ? ` > ${location.intermediateAdministrativeUnitTitle}` : ""}${location.narrowAdministrativeUnitTitle ? ` > ${location.narrowAdministrativeUnitTitle}` : ""}`}
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
  );
};

export default CLocationAdministrativeUnits;
