import {
  fetchLocationFormSubmission,
  fetchLocationFormSubmissionParamsSchema,
} from "@/lib/serverFunctions/queries/location";
import { parseQueryParams } from "@/lib/utils/apiCall";
import { checkIfLoggedInUserHasAnyPermission } from "@serverOnly/checkPermission";
import { NextRequest } from "next/server";
import superjson from "superjson";

export async function GET(request: NextRequest) {
  try {
    await checkIfLoggedInUserHasAnyPermission({
      roleGroups: ["PARK"],
    });
  } catch (e) {
    return new Response(
      "Unauthorized",
      {
        status: 401,
      },
    );
  }

  try {
    const params = parseQueryParams(
      fetchLocationFormSubmissionParamsSchema,
      request.nextUrl.searchParams,
    );
    const result = await fetchLocationFormSubmission({ params });

    return new Response(superjson.stringify(result), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (e) {
    return new Response("Erro ao consultar preenchimento da praça!", {
      status: 500,
    });
  }
}
