"use client";

import LoadingIcon from "@components/LoadingIcon";
import { FetchCitiesType } from "@queries/city";
import dynamic from "next/dynamic";
import { Suspense } from "react";

import PolygonsAndClientContainer from "./PolygonsAndClientContainer";

const MapProvider = dynamic(() => import("./mapProvider"), {
  ssr: false,
});

const Map = ({
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
  return (
    <MapProvider>
      <Suspense
        fallback={
          <div className="fixed left-0 top-0 z-50 flex h-full w-full flex-col items-center justify-center bg-black bg-opacity-50 text-lg">
            <LoadingIcon size={32} />
            Carregando praças...
          </div>
        }
      >
        <PolygonsAndClientContainer
          locationCategoriesPromise={locationCategoriesPromise}
          locationTypesPromise={locationTypesPromise}
          citiesPromise={citiesPromise}
        />
      </Suspense>
    </MapProvider>
  );
};

export default Map;
