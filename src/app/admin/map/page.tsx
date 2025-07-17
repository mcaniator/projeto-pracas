import { fetchCities } from "@queries/city";
import { fetchLocationCategories } from "@queries/locationCategory";
import { fetchLocationTypes } from "@queries/locationType";
import { fetchLocationsWithPolygon } from "@queries/polygon";
import { Suspense } from "react";

import LoadingIcon from "../../../components/LoadingIcon";
import Map from "./map";

const Page = () => {
  const citiesPromise = fetchCities();
  const locationCategoriesPromise = fetchLocationCategories();
  const locationTypesPromise = fetchLocationTypes();
  const locationsWithPolygonPromise = fetchLocationsWithPolygon();
  return (
    <Suspense
      fallback={
        <div className="flex justify-center">
          <LoadingIcon size={32} />
        </div>
      }
    >
      <Map
        locationCategoriesPromise={locationCategoriesPromise}
        locationTypesPromise={locationTypesPromise}
        citiesPromise={citiesPromise}
        locationsWithPolygonPromise={locationsWithPolygonPromise}
      />
    </Suspense>
  );
};

export default Page;
