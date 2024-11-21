import { searchLocationsById } from "@/serverActions/locationUtil";

import { fetchCities } from "../../../../../serverActions/cityUtil";
import { LocationUpdater } from "./locationUpdater";

const Edit = async ({ params }: { params: { locationId: string } }) => {
  const location = await searchLocationsById(parseInt(params.locationId));
  const cities = await fetchCities();

  // TODO: add error handling
  return location == null ?
      <div>Localização não encontrada</div>
    : <LocationUpdater location={location} cities={cities} />;
};
export default Edit;
