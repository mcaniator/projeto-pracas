import { searchLocationsById } from "@/serverActions/locationUtil";

import { LocationUpdater } from "./locationUpdater";

const Edit = async ({ params }: { params: { locationId: string } }) => {
  const location = await searchLocationsById(parseInt(params.locationId));

  // TODO: add error handling
  return location == null ?
      <div>Localização não encontrada</div>
    : <LocationUpdater location={location} />;
};
export default Edit;
