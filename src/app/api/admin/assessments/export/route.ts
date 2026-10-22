import {
  fetchAssessmentsExport,
  fetchAssessmentsExportParamsSchema,
} from "@/lib/serverFunctions/queries/assessmentExport";
import { checkIfLoggedInUserHasAnyPermission } from "@serverOnly/checkPermission";
import { NextRequest } from "next/server";

import { parseQueryParams } from "../../../../../lib/utils/apiCall";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    await checkIfLoggedInUserHasAnyPermission({ roleGroups: ["ASSESSMENT"] });
  } catch {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const params = parseQueryParams(
      fetchAssessmentsExportParamsSchema,
      request.nextUrl.searchParams,
    );
    const result = await fetchAssessmentsExport({ params });

    if (!result.data || result.responseInfo.statusCode !== 200) {
      return new Response(
        result.responseInfo.message ?? "Erro ao gerar o arquivo de avaliações.",
        { status: result.responseInfo.statusCode },
      );
    }

    return new Response(new Uint8Array(result.data.buffer), {
      status: 200,
      headers: {
        "Content-Type": result.data.contentType,
        "Content-Disposition": `attachment; filename="${result.data.fileName}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return new Response("Parâmetros de exportação inválidos.", { status: 400 });
  }
}
