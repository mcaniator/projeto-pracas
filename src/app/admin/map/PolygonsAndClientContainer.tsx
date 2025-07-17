"use client";

import { LocationsWithPolygonResponse } from "@customTypes/location/location";
import { use } from "react";

import { FetchCitiesType } from "../../../lib/serverFunctions/queries/city";
import Client from "./client";
import PolygonProvider from "./polygonProvider";

const PolygonsAndClientContainer = ({
  locationsWithPolygonPromise,
  citiesPromise,
  locationCategoriesPromise,
  locationTypesPromise,
}: {
  locationsWithPolygonPromise: Promise<LocationsWithPolygonResponse>;
  citiesPromise: Promise<FetchCitiesType>;
  locationCategoriesPromise: Promise<{
    statusCode: number;
    message: string;
    categories: { id: number; name: string }[];
  }>;
  locationTypesPromise: Promise<{
    statusCode: number;
    message: string;
    types: { id: number; name: string }[];
  }>;
}) => {
  const locationsWithPolygon = use(locationsWithPolygonPromise);
  return (
    <PolygonProvider fullLocationsPromise={locationsWithPolygon}>
      <Client
        locationsPromise={locationsWithPolygon}
        citiesPromise={citiesPromise}
        locationCategoriesPromise={locationCategoriesPromise}
        locationTypesPromise={locationTypesPromise}
      />
    </PolygonProvider>
  );
};

export default PolygonsAndClientContainer;
