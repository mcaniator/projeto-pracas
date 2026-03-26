import { parseQueryParams } from "@/lib/utils/apiCall";
import { booleanFromString } from "@/lib/zodValidators";
import {
  searchQuestionsByCategoryAndSubcategory,
  searchQuestionsByName,
} from "@queries/question";
import { checkIfLoggedInUserHasAnyPermission } from "@serverOnly/checkPermission";
import { NextRequest } from "next/server";
import { z } from "zod";

const paramsSchema = z.object({
  categoryId: z.coerce.number().int().nullish(),
  subcategoryId: z.coerce.number().nullish(),
  verifySubcategoryNullness: booleanFromString.nullish(),
  name: z.string().optional().nullish(),
});

export type FetchQuestionsByCategoryAndSubcategoryParams = z.infer<
  typeof paramsSchema
>;

export async function GET(request: NextRequest) {
  try {
    await checkIfLoggedInUserHasAnyPermission({ roleGroups: ["FORM"] });
  } catch (e) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const searchParams = request.nextUrl.searchParams;
    const params = parseQueryParams(paramsSchema, searchParams);
    if (params.name) {
      const questions = await searchQuestionsByName(params.name);
      return new Response(JSON.stringify(questions), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }
    const questions = await searchQuestionsByCategoryAndSubcategory(params);
    return new Response(JSON.stringify(questions), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response("Error fetching questions", { status: 500 });
  }
}
