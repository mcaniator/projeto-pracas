import {
  _deleteLocationCategoryOrType,
  deleteLocationCategoryOrTypeDataSchema,
} from "@/lib/serverFunctions/mutations/locationCategory";
import { checkIfLoggedInUserHasAnyPermission } from "@serverOnly/checkPermission";

export async function POST(request: Request) {
  try {
    try {
      await checkIfLoggedInUserHasAnyPermission({ roles: ["PARK_MANAGER"] });
    } catch (e) {
      return new Response("Unauthorized", { status: 401 });
    }

    const data = deleteLocationCategoryOrTypeDataSchema.parse(
      await request.formData(),
    );
    const result = await _deleteLocationCategoryOrType(data);
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response("Internal Server Error", { status: 500 });
  }
}
