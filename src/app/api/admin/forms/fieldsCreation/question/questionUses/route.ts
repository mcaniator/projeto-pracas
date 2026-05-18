import { parseQueryParams } from "@/lib/utils/apiCall";
import { fetchQuestionUses } from "@queries/question";
import { checkIfLoggedInUserHasAnyPermission } from "@serverOnly/checkPermission";
import { NextRequest } from "next/server";
import { z } from "zod";

const paramsSchema = z.object({
  questionId: z.coerce.number().int(),
});

export type FetchQuestionUsesParams = z.infer<typeof paramsSchema>;

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
    const params = parseQueryParams(paramsSchema, searchParams);
    const questionUses = await fetchQuestionUses(params);
    return new Response(JSON.stringify(questionUses), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response("Erro ao consultar usos da questão!", { status: 500 });
  }
}
