import { LocationWithPolygon } from "@customTypes/location/location";
import { prisma } from "@lib/prisma";
import { checkIfLoggedInUserHasAnyPermission } from "@serverOnly/checkPermission";

export async function GET() {
  try {
    try {
      await checkIfLoggedInUserHasAnyPermission({ roleGroups: ["PARK"] });
    } catch (e) {
      return new Response("Unauthorized", { status: 401 });
    }
    const locations = await prisma.$queryRaw<Array<LocationWithPolygon>>`
          SELECT 
            id,
            name,
            ST_AsGeoJSON(polygon)::text as st_asgeojson
          FROM location 
        `;
    return new Response(JSON.stringify(locations), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response("Error fetching locations", { status: 500 });
  }
}
