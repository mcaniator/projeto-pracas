import {
  _exportAssessments,
  exportAssessmentsDataSchema,
} from "@/lib/serverFunctions/mutations/exportToCSV";
import { checkIfLoggedInUserHasAnyPermission } from "@serverOnly/checkPermission";
import superjson from "superjson";

export async function POST(request: Request) {
  try {
    try {
      await checkIfLoggedInUserHasAnyPermission({
        roleGroups: ["ASSESSMENT"],
      });
    } catch (e) {
      return new Response("Unauthorized", { status: 401 });
    }
    const data = exportAssessmentsDataSchema.parse(await request.json());
    const result = await _exportAssessments({ data });
    return new Response(superjson.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response("Internal Server Error", { status: 500 });
  }
}
