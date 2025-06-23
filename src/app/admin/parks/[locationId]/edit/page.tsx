import { searchLocationsById } from "@/serverActions/locationUtil";

import LocationRegisterForm from "../../../../../components/locationForm/locationRegisterForm";
import { ParkData } from "../../../../../components/locationForm/locationRegisterFormClient";
import { fetchCities } from "../../../../../serverActions/cityUtil";
import { fetchLocationCategories } from "../../../../../serverActions/locationCategoryUtil";
import { fetchLocationTypes } from "../../../../../serverActions/locationTypeUtil";
import DeleteLocationModal from "./deleteLocationModal";

const Edit = async (props: { params: Promise<{ locationId: string }> }) => {
  const params = await props.params;
  const location = (await searchLocationsById(parseInt(params.locationId)))
    .location;
  const cities = await fetchCities();
  const locationCategories = await fetchLocationCategories();
  const locationTypes = await fetchLocationTypes();
  if (!location) {
    return <div>Localização não encontrada</div>;
  }
  const city =
    location.narrowAdministrativeUnit?.city ??
    location.intermediateAdministrativeUnit?.city ??
    location.broadAdministrativeUnit?.city ??
    null;
  const formattedLocation: ParkData = {
    name: location.name ?? null,
    popularName: location.popularName ?? null,
    firstStreet: location.firstStreet ?? null,
    secondStreet: location.secondStreet ?? null,
    thirdStreet: location.thirdStreet ?? null,
    fourthStreet: location.fourthStreet ?? null,
    city: city?.name ?? null,
    state: city?.state ?? null,
    notes: location.notes ?? null,
    creationYear: location.creationYear ?? null,
    lastMaintenanceYear: location.lastMaintenanceYear ?? null,
    overseeingMayor: location.overseeingMayor ?? null,
    legislation: location.legislation ?? null,
    usableArea: location.usableArea?.toString() ?? null,
    legalArea: location.legalArea?.toString() ?? null,
    incline: location.incline?.toString() ?? null,
    narrowAdministrativeUnit: location.narrowAdministrativeUnit?.name ?? null,
    intermediateAdministrativeUnit:
      location.intermediateAdministrativeUnit?.name ?? null,
    broadAdministrativeUnit: location.broadAdministrativeUnit?.name ?? null,
    isPark: location.isPark ?? true,
    inactiveNotFound: location.inactiveNotFound ?? false,
    category: location.category?.name ?? null,
    type: location.type?.name ?? null,
    hasGeometry: location.hasGeometry,
  };
  // TODO: add error handling
  return (
    <div
      className={
        "flex h-full flex-col gap-1 overflow-auto rounded-tr-3xl bg-gray-300/30 p-3 shadow-md"
      }
    >
      <h2 className="text-2xl font-semibold">{`Editando ${location?.name}`}</h2>
      {location == null ?
        <div>Localização não encontrada</div>
      : <LocationRegisterForm
          formType="EDIT"
          hasDrawing={false}
          cities={cities}
          location={formattedLocation}
          locationId={location.id}
          locationCategories={locationCategories}
          locationTypes={locationTypes}
        />
      }
      <div>
        <DeleteLocationModal
          locationId={location.id}
          locationName={location.name}
        />
      </div>
    </div>
  );
};
export default Edit;
