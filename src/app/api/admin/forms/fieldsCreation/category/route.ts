import { fetchCategoriesForFieldsCreation } from "@queries/category";
import { checkIfLoggedInUserHasAnyPermission } from "@serverOnly/checkPermission";
import superjson from "superjson";

export async function GET() {
  try {
    try {
      await checkIfLoggedInUserHasAnyPermission({ roleGroups: ["FORM"] });
    } catch (e) {
      return new Response("Unauthorized", { status: 401 });
    }
    const categories = await fetchCategoriesForFieldsCreation({});
    return new Response(superjson.stringify(categories), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response("Error fetching categories", { status: 500 });
  }
}
