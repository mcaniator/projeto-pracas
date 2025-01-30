import { searchLocationsById } from "@/serverActions/locationUtil";

import { fetchCities } from "../../../../../serverActions/cityUtil";
import { LocationUpdater } from "./locationUpdater";

const Edit = async ({ params }: { params: { locationId: string } }) => {
  const location = await searchLocationsById(parseInt(params.locationId));
  const cities = await fetchCities();

  // TODO: add error handling
  return (
    <div
      className={
        "flex h-full flex-col gap-1 overflow-auto rounded-3xl bg-gray-300/30 p-3 text-white shadow-md"
      }
    >
      <h2 className="text-2xl font-semibold">{`Editando ${location?.name}`}</h2>
      {location == null ?
        <div>Localização não encontrada</div>
      : <LocationUpdater location={location} cities={cities} />}
    </div>
  );
};
export default Edit;
