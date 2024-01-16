import { searchLocationsById } from "@/serverActions/locationUtil";
import { use } from "react";

import LocationUpdater from "./locationUpdater";

const Edit = ({ params }: { params: { locationId: string } }) => {
  const location = use(searchLocationsById(parseInt(params.locationId)));

  // TODO: add error handling
  if (location === undefined || location === null) {
    <div>Localização não encontrada</div>;
  } else return <LocationUpdater location={location}></LocationUpdater>;
};
export default Edit;
