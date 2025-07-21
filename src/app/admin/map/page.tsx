import { fetchCities } from "@queries/city";
import { fetchLocationCategories } from "@queries/locationCategory";
import { fetchLocationTypes } from "@queries/locationType";
import { Suspense } from "react";

import LoadingIcon from "../../../components/LoadingIcon";
import Map from "./map";

const Page = () => {
  const citiesPromise = fetchCities();
  const locationCategoriesPromise = fetchLocationCategories();
  const locationTypesPromise = fetchLocationTypes();
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
      />
    </Suspense>
  );
};

export default Page;
