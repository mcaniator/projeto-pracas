import type { PublicFetchPublicAssessmentTreeParams } from "@/lib/serverFunctions/queries/public/assessment";
import { publicFetchPublicAssessmentTree } from "@/lib/serverFunctions/queries/public/assessment";
import { NextRequest } from "next/server";
import superjson from "superjson";

export async function GET(
  request: NextRequest,
  props: {
    params: Promise<PublicFetchPublicAssessmentTreeParams>;
  },
) {
  try {
    const assessments = await publicFetchPublicAssessmentTree(
      await props.params,
    );
    return new Response(superjson.stringify(assessments), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "private, max-age=60",
      },
    });
  } catch (error) {
    return new Response("Error fetching assessments", { status: 500 });
  }
}
