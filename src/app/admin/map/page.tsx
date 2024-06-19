import { prisma } from "@/lib/prisma";
import { fetchPolygons } from "@/serverActions/managePolygons";
import { Location } from "@prisma/client";
import { unstable_cache } from "next/cache";
import dynamic from "next/dynamic";

const MapProvider = dynamic(() => import("./mapProvider"), { ssr: false });
const Client = dynamic(() => import("./client"), { ssr: false });
const PolygonProvider = dynamic(() => import("./polygonProvider"), {
  ssr: false,
});

interface fullLocation extends Location {
  st_asgeojson: string | null;
}

const Page = async () => {
  const polygons = await fetchPolygons();

  const locationsCache = unstable_cache(
    async () => await prisma.location.findMany(),
    ["location"],
    { tags: ["database", "location"] },
  );
  const locations = await locationsCache();

  const fullLocations: fullLocation[] = locations.map((location) => {
    const matchingPolygon = polygons.find(
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
        <Client locations={fullLocations} />
      </PolygonProvider>
    </MapProvider>
  );
};

export default Page;
