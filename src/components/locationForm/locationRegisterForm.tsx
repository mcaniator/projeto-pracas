"use client";

import { ParkRegisterData } from "@customTypes/parks/parkRegister";

import { FetchCitiesType } from "../../serverActions/cityUtil";
import LocationRegisterFormClient from "./locationRegisterFormClient";

type LocationFormType = "CREATE" | "EDIT";

const LocationRegisterForm = ({
  hasDrawing,
  cities,
  location,
  formType,
  locationId,
  featuresGeoJson,
  locationCategories,
  locationTypes,
  onSuccess,
}: {
  hasDrawing: boolean;
  cities: FetchCitiesType;
  location?: ParkRegisterData;
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
      hasDrawing={hasDrawing}
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
