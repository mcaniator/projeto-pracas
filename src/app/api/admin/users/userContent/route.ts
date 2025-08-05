import { getUserContentAmount } from "@queries/user";
import { checkIfLoggedInUserHasAnyPermission } from "@serverOnly/checkPermission";
import { NextRequest } from "next/server";
import { z } from "zod";

export async function GET(request: NextRequest) {
  try {
    try {
      await checkIfLoggedInUserHasAnyPermission({ roleGroups: ["USER"] });
    } catch (e) {
      return new Response("Unauthorized", { status: 401 });
    }
    const userId = z.coerce
      .string()
      .parse(request.nextUrl.searchParams.get("userId"));

    const userContentAmount = await getUserContentAmount(userId);
    return new Response(JSON.stringify(userContentAmount), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response("Error fetching locations", { status: 500 });
  }
}
