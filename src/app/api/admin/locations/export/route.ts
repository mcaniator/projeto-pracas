import { checkIfLoggedInUserHasAnyPermission } from "@serverOnly/checkPermission";
import { NextRequest } from "next/server";

import { parseQueryParams } from "../../../../../lib/utils/apiCall";
import { fetchLocationExport, fetchLocationExportParamsSchema } from "@/lib/serverFunctions/queries/locationExport";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    await checkIfLoggedInUserHasAnyPermission({ roleGroups: ["PARK"] });
  } catch {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const params = parseQueryParams(
      fetchLocationExportParamsSchema,
      request.nextUrl.searchParams,
    );
    const result = await fetchLocationExport({ params });

    if (!result.data || result.responseInfo.statusCode !== 200) {
      return new Response(
        result.responseInfo.message ?? "Erro ao gerar o arquivo de dados cadastrais de praças.",
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
