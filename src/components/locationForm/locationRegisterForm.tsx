"use server";

import { FetchCitiesType } from "../../serverActions/cityUtil";
import { fetchLocationCategories } from "../../serverActions/locationCategoryUtil";
import { fetchLocationTypes } from "../../serverActions/locationTypeUtil";
import LocationRegisterFormClient, {
  ParkData,
} from "./locationRegisterFormClient";

type LocationFormType = "CREATE" | "EDIT";

const LocationRegisterForm = async ({
  cities,
  location,
  formType,
  locationId,
  featuresGeoJson,
  onSuccess,
}: {
  cities: FetchCitiesType;
  location?: ParkData;
  formType: LocationFormType;
  locationId?: number;
  featuresGeoJson?: string;
  onSuccess?: () => void;
}) => {
  const locationCategories = await fetchLocationCategories();
  const locationTypes = await fetchLocationTypes();
  return (
    <LocationRegisterFormClient
      cities={cities}
      location={location}
      formType={formType}
      locationId={locationId}
      featuresGeoJson={featuresGeoJson}
      onSuccess={onSuccess}
      locationCategories={locationCategories}
      locationTypes={locationTypes}
    />
  );
};

export default LocationRegisterForm;
export { type LocationFormType };
