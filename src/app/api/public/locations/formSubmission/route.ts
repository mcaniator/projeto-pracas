import {
  publicFetchLocationFormSubmission,
  publicFetchLocationFormSubmissionParamsSchema,
} from "@/lib/serverFunctions/queries/public/location";
import { parseQueryParams } from "@/lib/utils/apiCall";
import { NextRequest } from "next/server";
import superjson from "superjson";

export async function GET(request: NextRequest) {
  try {
    const params = parseQueryParams(
      publicFetchLocationFormSubmissionParamsSchema,
      request.nextUrl.searchParams,
    );
    const result = await publicFetchLocationFormSubmission({ params });

    return new Response(superjson.stringify(result), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch {
    return new Response("Erro ao consultar preenchimento da praça!", {
      status: 500,
    });
  }
}
