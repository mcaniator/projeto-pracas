import { fetchCities } from "@queries/city";
import { fetchLocationCategories } from "@queries/locationCategory";
import { fetchLocationTypes } from "@queries/locationType";
import { fetchLocationsWithPolygon } from "@queries/polygon";
import { Suspense } from "react";

import LoadingIcon from "../../../components/LoadingIcon";
import Client from "./client";
//Polygon provider cannot be imported dynamically, because it creates errors in compiled builds.
import MapProvider from "./mapProvider";
import PolygonProvider from "./polygonProvider";

const Page = () => {
  const citiesPromise = fetchCities();
  const locationCategoriesPromise = fetchLocationCategories();
  const locationTypesPromise = fetchLocationTypes();

  //const locationsResponse = await fetchLocationsNames();
  //const locations = locationsResponse.locations

  const locationsWithPolygonPromise = fetchLocationsWithPolygon();

  //console.log(locationsWithPolygon);

  return (
    <MapProvider>
      <Suspense
        fallback={
          <div className="flex justify-center">
            <LoadingIcon size={32} />
          </div>
        }
      >
        <PolygonProvider fullLocationsPromise={locationsWithPolygonPromise}>
          <Client
            locationsPromise={locationsWithPolygonPromise}
            citiesPromise={citiesPromise}
            locationCategoriesPromise={locationCategoriesPromise}
            locationTypesPromise={locationTypesPromise}
          />
        </PolygonProvider>
      </Suspense>
    </MapProvider>
  );
};

export default Page;
