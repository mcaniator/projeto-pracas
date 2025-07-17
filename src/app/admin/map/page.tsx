import { fetchCities } from "@queries/city";
import { fetchLocationCategories } from "@queries/locationCategory";
import { fetchLocationTypes } from "@queries/locationType";
import { fetchPolygons } from "@queries/polygon";

import { prisma } from "../../../lib/prisma";
import Client from "./client";
//Polygon provider cannot be imported dynamically, because it creates errors in compiled builds.
import MapProvider from "./mapProvider";
import PolygonProvider from "./polygonProvider";

const Page = async () => {
  const polygons = await fetchPolygons();
  const citiesPromise = fetchCities();
  const locationCategoriesPromise = fetchLocationCategories();
  const locationTypesPromise = fetchLocationTypes();

  //const locationsResponse = await fetchLocationsNames();
  //const locations = locationsResponse.locations

  const locations = await prisma.location.findMany();

  //const locationsWithPolygonPromise = await fetchLocationsWithPolygon();

  //console.log(locationsWithPolygon);

  const fullLocations = locations.map((location) => {
    const matchingPolygon = polygons.polygons.find(
      (polygon) => polygon.id === location.id,
    );

    let toReturn;
    if (matchingPolygon !== undefined) {
      toReturn = { ...location, st_asgeojson: matchingPolygon.st_asgeojson };
    } else {
      toReturn = { ...location, st_asgeojson: null };
    }

    return toReturn;
  });

  return (
    <MapProvider>
      <PolygonProvider polygons={polygons} locations={locations}>
        <Client
          locationsPromise={fullLocations}
          citiesPromise={citiesPromise}
          locationCategoriesPromise={locationCategoriesPromise}
          locationTypesPromise={locationTypesPromise}
        />
      </PolygonProvider>
    </MapProvider>
  );
};

export default Page;
