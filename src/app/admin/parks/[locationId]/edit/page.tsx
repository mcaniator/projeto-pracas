import { searchLocationsById } from "@/serverActions/locationUtil";

import LocationRegisterForm from "../../../../../components/locationForm/locationRegisterForm";
import { ParkData } from "../../../../../components/locationForm/locationRegisterFormClient";
import { fetchCities } from "../../../../../serverActions/cityUtil";

const Edit = async ({ params }: { params: { locationId: string } }) => {
  const location = (await searchLocationsById(parseInt(params.locationId)))
    .location;
  const cities = await fetchCities();
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
        "flex h-full flex-col gap-1 overflow-auto rounded-tr-3xl bg-gray-300/30 p-3 text-white shadow-md"
      }
    >
      <h2 className="text-2xl font-semibold">{`Editando ${location?.name}`}</h2>
      {location == null ?
        <div>Localização não encontrada</div>
      : <LocationRegisterForm
          formType="EDIT"
          cities={cities}
          location={formattedLocation}
          locationId={location.id}
        />
      }
    </div>
  );
};
export default Edit;
