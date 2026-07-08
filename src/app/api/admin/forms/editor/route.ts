import { fetchFormEditorParamsSchema } from "@/lib/serverFunctions/apiCalls/formParamsSchemas";
import {
  getCalculationByFormId,
  getFormTree,
} from "@/lib/serverFunctions/queries/form";
import { parseQueryParams } from "@/lib/utils/apiCall";
import { checkIfLoggedInUserHasAnyPermission } from "@serverOnly/checkPermission";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
    await checkIfLoggedInUserHasAnyPermission({ roleGroups: ["FORM"] });
  } catch (e) {
    return new Response("Unauthorized", { status: 401 });
  }

  const params = parseQueryParams(
    fetchFormEditorParamsSchema,
    request.nextUrl.searchParams,
  );
  const [form, calculations] = await Promise.all([
    getFormTree({ formId: params.formId }),
    getCalculationByFormId(params.formId),
  ]);

  return new Response(
    JSON.stringify({
      responseInfo: {
        statusCode: form.statusCode === 200 ? calculations.statusCode : form.statusCode,
      },
      data: {
        form,
        calculations: calculations.calculations,
      },
    }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    },
  );
}
