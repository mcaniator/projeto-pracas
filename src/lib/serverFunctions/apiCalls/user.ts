import { FetchUsersResponse } from "@/lib/serverFunctions/queries/user";
import { UseFetchAPIParams } from "@/lib/types/backendCalls/APIResponse";
import { useFetchAPI } from "@/lib/utils/useFetchAPI";
import { OrdersObj } from "@app/admin/users/usersTable";
import { TableUser } from "@customTypes/users/usersTable";
import { z } from "zod";

import { tableUserSchema } from "../../zodValidators";

const _getUsers = async (
  page: number,
  take: number,
  search: string | null,
  orders: OrdersObj,
  activeUsersFilters: boolean,
) => {
  try {
    const queryParams = new URLSearchParams();

    queryParams.append("page", String(page ?? 1));
    queryParams.append("take", String(take));
    if (search) {
      queryParams.append("search", String(search));
    }
    queryParams.append("orders", JSON.stringify(orders));
    queryParams.append("activeUsersFilter", String(activeUsersFilters));

    const url = `/api/admin/users/usersTable?${queryParams.toString()}`;

    const response = await fetch(url, {
      method: "GET",
      next: { tags: ["user", "database"] },
    });

    if (!response.ok) {
      return { statusCode: 500, users: null, totalUsers: 0 };
    }

    const responseJson = (await response.json()) as {
      statusCode: number;
      users: TableUser[];
      totalUsers: number;
    };
    const users = z
      .object({
        statusCode: z.coerce.number(),
        totalUsers: z.coerce.number(),
        users: z.array(tableUserSchema),
      })
      .parse(responseJson);
    return users;
  } catch (e) {
    return { statusCode: 500, users: null, totalUsers: 0 };
  }
};

const _getUserContentAmount = async ({ userId }: { userId: string }) => {
  try {
    const queryParams = new URLSearchParams();

    queryParams.append("userId", userId);

    const response = await fetch(
      `/api/admin/users/userContent?${queryParams.toString()}`,
    );
    const responseJson = (await response.json()) as {
      statusCode: number;
      assessments: number | null;
      tallys: number | null;
    };
    const userContentAmount = z
      .object({
        statusCode: z.coerce.number(),
        assessments: z.coerce.number(),
        tallys: z.coerce.number(),
      })
      .parse(responseJson);
    return userContentAmount;
  } catch (e) {
    return { statusCode: 500, assessments: null, tallys: null };
  }
};

export const useFetchUsers = (
  params?: UseFetchAPIParams<FetchUsersResponse>,
) => {
  const url = "/api/admin/users/usersTable";
  return useFetchAPI<FetchUsersResponse>({
    url,
    callbacks: params?.callbacks,
    options: {
      method: "GET",
      next: { tags: ["user", "database"] },
    },
  });
};

export { _getUsers, _getUserContentAmount };
