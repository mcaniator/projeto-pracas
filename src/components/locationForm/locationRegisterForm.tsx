"use client";

import { FetchCitiesType } from "../../serverActions/cityUtil";
import LocationRegisterFormClient, {
  ParkData,
} from "./locationRegisterFormClient";

type LocationFormType = "CREATE" | "EDIT";

const LocationRegisterForm = ({
  cities,
  location,
  formType,
  locationId,
  featuresGeoJson,
  locationCategories,
  locationTypes,
  onSuccess,
}: {
  cities: FetchCitiesType;
  location?: ParkData;
  formType: LocationFormType;
  locationId?: number;
  featuresGeoJson?: string;
  locationCategories: {
    statusCode: number;
    message: string;
    categories: {
      id: number;
      name: string;
    }[];
  };
  locationTypes: {
    statusCode: number;
    message: string;
    types: {
      id: number;
      name: string;
    }[];
  };
  onSuccess?: () => void;
}) => {
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
