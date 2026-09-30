import { parseQueryParams } from "@/lib/utils/apiCall";
import {
  getCategoriesWithSubcategories,
  getCategoriesWithSubcategoriesParamsSchema,
} from "@queries/category";
import { checkIfLoggedInUserHasAnyPermission } from "@serverOnly/checkPermission";
import { NextRequest } from "next/server";
import superjson from "superjson";

export async function GET(request: NextRequest) {
  try {
    try {
      await checkIfLoggedInUserHasAnyPermission({
        roleGroups: ["PROTOCOL"],
      });
    } catch (e) {
      return new Response("Unauthorized", { status: 401 });
    }
    const params = parseQueryParams(
      getCategoriesWithSubcategoriesParamsSchema,
      request.nextUrl.searchParams,
    );
    const categories = await getCategoriesWithSubcategories({ params });
    return new Response(superjson.stringify(categories), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response("Error fetching categories", { status: 500 });
  }
}
