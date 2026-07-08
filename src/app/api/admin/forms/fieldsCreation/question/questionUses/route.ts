import { fetchQuestionUsesParamsSchema } from "@/lib/serverFunctions/apiCalls/questionParamsSchemas";
import { parseQueryParams } from "@/lib/utils/apiCall";
import { fetchQuestionUses } from "@queries/question";
import { checkIfLoggedInUserHasAnyPermission } from "@serverOnly/checkPermission";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
    await checkIfLoggedInUserHasAnyPermission({ roleGroups: ["FORM"] });
  } catch (e) {
    return new Response("Unauthorized", {
      status: 401,
    });
  }

  try {
    const searchParams = request.nextUrl.searchParams;
    const params = parseQueryParams(fetchQuestionUsesParamsSchema, searchParams);
    const questionUses = await fetchQuestionUses(params);
    return new Response(JSON.stringify(questionUses), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response("Erro ao consultar usos da questão!", { status: 500 });
  }
}
