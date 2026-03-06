import { publicFetchTallys } from "@/lib/serverFunctions/queries/public/tally";
import { parseQueryParams } from "@/lib/utils/apiCall";
import { NextRequest } from "next/server";
import { z } from "zod";

const paramsSchema = z.object({
  locationId: z.coerce.number().optional(),
});

export type PublicFetchTallysParams = z.infer<typeof paramsSchema>;

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const params = parseQueryParams(paramsSchema, searchParams);
    const tallys = await publicFetchTallys(params);
    return new Response(JSON.stringify(tallys), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch (error) {
    return new Response("Error fetching assessments", { status: 500 });
  }
}
