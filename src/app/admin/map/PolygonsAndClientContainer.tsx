"use client";

import { useLoadingOverlay } from "@components/context/loadingContext";
import { LocationsWithPolygonResponse } from "@customTypes/location/location";
import { FetchCitiesType } from "@queries/city";
import { useCallback, useEffect, useState } from "react";

import { _searchLocationsForMap } from "../../../lib/serverFunctions/apiCalls/location";
import Client from "./client";
import PolygonProvider from "./polygonProvider";

const PolygonsAndClientContainer = ({
  citiesPromise,
  locationCategoriesPromise,
  locationTypesPromise,
}: {
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
  //const locationsWithPolygon = use(locationsWithPolygonPromise);
  const { setLoadingOverlay } = useLoadingOverlay();
  const [locationsWithPolygon, setLocationsWithPolygon] =
    useState<LocationsWithPolygonResponse>({ statusCode: 1, locations: [] });
  const fetchLocations = useCallback(async () => {
    setLoadingOverlay({ show: true, message: "Carregando praças..." });
    const locationsResponse = await _searchLocationsForMap();
    const locations = locationsResponse.locations;
    setLocationsWithPolygon({
      statusCode: locationsResponse.statusCode,
      locations,
    });
    setLoadingOverlay({ show: false });
  }, [setLoadingOverlay]);
  useEffect(() => {
    void fetchLocations();
  }, [setLoadingOverlay, fetchLocations]);
  return (
    <PolygonProvider fullLocationsPromise={locationsWithPolygon}>
      <Client
        locationsPromise={locationsWithPolygon}
        citiesPromise={citiesPromise}
        locationCategoriesPromise={locationCategoriesPromise}
        locationTypesPromise={locationTypesPromise}
        fetchLocations={fetchLocations}
      />
    </PolygonProvider>
  );
};

export default PolygonsAndClientContainer;
