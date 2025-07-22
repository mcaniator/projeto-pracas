"use client";

import { useLoadingOverlay } from "@components/context/loadingContext";
import {
  LocationWithPolygon,
  LocationsWithPolygonResponse,
} from "@customTypes/location/location";
import { FetchCitiesType } from "@queries/city";
import { useCallback, useEffect, useState } from "react";

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
  const { setLoadingOverlayVisible } = useLoadingOverlay();
  const [locationsWithPolygon, setLocationsWithPolygon] =
    useState<LocationsWithPolygonResponse>({ statusCode: 1, locations: [] });
  const fetchLocations = useCallback(async () => {
    setLoadingOverlayVisible(true);
    const locationsResponse = await fetch("/api/admin/map/locations", {
      method: "GET",
      next: { tags: ["location", "database"] },
    });
    const locations = (await locationsResponse.json()) as LocationWithPolygon[];
    setLocationsWithPolygon({
      statusCode: locationsResponse.status,
      locations,
    });
    setLoadingOverlayVisible(false);
  }, [setLoadingOverlayVisible]);
  useEffect(() => {
    void fetchLocations();
  }, [setLoadingOverlayVisible, fetchLocations]);
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
