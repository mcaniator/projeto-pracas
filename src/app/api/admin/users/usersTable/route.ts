import { Order } from "@app/admin/users/usersTable";
import { getUsers } from "@queries/user";
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
    const page = z.coerce
      .number()
      .parse(request.nextUrl.searchParams.get("page"));
    const take = z.coerce
      .number()
      .parse(request.nextUrl.searchParams.get("take"));
    const search = z.coerce
      .string()
      .nullish()
      .parse(request.nextUrl.searchParams.get("search"));
    const ordersStr = request.nextUrl.searchParams.get("orders");
    if (!ordersStr) {
      throw new Error("Orders object is mandatory");
    }

    const orders = z
      .object({
        email: z.coerce.string(),
        name: z.coerce.string(),
        username: z.coerce.string(),
        createdAt: z.coerce.string(),
      })
      .parse(JSON.parse(ordersStr)) as {
      email: Order;
      name: Order;
      username: Order;
      createdAt: Order;
    };

    const activeUsersFilter = z
      .enum(["true", "false"])
      .transform((val) => val === "true")
      .parse(request.nextUrl.searchParams.get("activeUsersFilter") ?? "false");
    const users = await getUsers(page, take, search, orders, activeUsersFilter);
    return new Response(JSON.stringify(users), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response("Error fetching locations", { status: 500 });
  }
}
