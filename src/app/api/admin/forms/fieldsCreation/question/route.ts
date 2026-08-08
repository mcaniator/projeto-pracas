import { fetchQuestionsByCategoryAndSubcategoryParamsSchema } from "@/lib/serverFunctions/queries/question";
import { parseQueryParams } from "@/lib/utils/apiCall";
import {
  searchQuestionsByCategoryAndSubcategory,
  searchQuestionsByName,
} from "@queries/question";
import { checkIfLoggedInUserHasAnyPermission } from "@serverOnly/checkPermission";
import { NextRequest } from "next/server";
import superjson from "superjson";

export async function GET(request: NextRequest) {
  try {
    await checkIfLoggedInUserHasAnyPermission({ roleGroups: ["FORM"] });
  } catch (e) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const searchParams = request.nextUrl.searchParams;
    const params = parseQueryParams(
      fetchQuestionsByCategoryAndSubcategoryParamsSchema,
      searchParams,
    );
    if (params.name) {
      const questions = await searchQuestionsByName(params.name);
      return new Response(superjson.stringify(questions), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }
    const questions = await searchQuestionsByCategoryAndSubcategory(params);
    return new Response(superjson.stringify(questions), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response("Error fetching questions", { status: 500 });
  }
}
