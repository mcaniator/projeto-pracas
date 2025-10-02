import {
  searchQuestionsByCategoryAndSubcategory,
  searchQuestionsByName,
} from "@queries/question";
import { checkIfLoggedInUserHasAnyPermission } from "@serverOnly/checkPermission";
import { NextRequest } from "next/server";
import { z } from "zod";

export async function GET(request: NextRequest) {
  try {
    await checkIfLoggedInUserHasAnyPermission({ roleGroups: ["FORM"] });
  } catch (e) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const categoryId = z.coerce
      .number()
      .parse(request.nextUrl.searchParams.get("categoryId"));
    const subcategoryId = z.coerce
      .number()
      .parse(request.nextUrl.searchParams.get("subcategoryId"));
    const verCatNull = z
      .enum(["true", "false"])
      .transform((val) => val === "true")
      .parse(request.nextUrl.searchParams.get("verCatNull") ?? "false");
    const name = z.string().safeParse(request.nextUrl.searchParams.get("name"));
    if (name.success) {
      const questions = await searchQuestionsByName(name.data);
      return new Response(JSON.stringify(questions), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }
    const questions = await searchQuestionsByCategoryAndSubcategory(
      categoryId,
      subcategoryId,
      verCatNull,
    );
    return new Response(JSON.stringify(questions), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response("Error fetching questions", { status: 500 });
  }
}
