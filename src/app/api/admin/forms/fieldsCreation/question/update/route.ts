import {
  _questionUpdate,
  questionUpdateDataSchema,
} from "@/lib/serverFunctions/mutations/questionUtil";
import { checkIfLoggedInUserHasAnyPermission } from "@serverOnly/checkPermission";

export async function POST(request: Request) {
  try {
    try {
      await checkIfLoggedInUserHasAnyPermission({ roles: ["FORM_MANAGER"] });
    } catch (e) {
      return new Response("Unauthorized", { status: 401 });
    }
    const data = questionUpdateDataSchema.parse(await request.formData());
    const result = await _questionUpdate(data);
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response("Internal Server Error", { status: 500 });
  }
}
