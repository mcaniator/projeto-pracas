"use client";

import { IconSearch } from "@tabler/icons-react";
import { useCallback, useEffect, useRef, useState } from "react";

import LoadingIcon from "../../../components/LoadingIcon";
import { Button } from "../../../components/button";
import { Input } from "../../../components/ui/input";
import { getUsers } from "../../../serverActions/userUtil";
import UsersTable, { OrdersObj } from "./usersTable";

type TableUser = {
  image: string;
  username?: string;
  email: string;
  name: string;
  createdAt: Date;
  permissions: { id: number; feature: string }[];
};
const UsersClient = () => {
  const [search, setSearch] = useState<string>("");
  const searchRef = useRef("");
  const [users, setUsers] = useState<TableUser[]>([]);
  const [totalUsers, setTotalUsers] = useState<number | null>(null);
  const [pagination, setPagination] = useState<{
    page: number;
    pageSize: number;
  }>({
    page: 1,
    pageSize: 10,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [orders, setOrders] = useState<OrdersObj>({
    email: "none",
    name: "none",
    username: "none",
    createdAt: "desc",
  });

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const users = await getUsers(
        pagination.page,
        pagination.pageSize,
        searchRef.current,
        orders,
      );
      if (users.statusCode === 200) {
        setUsers(users.users as TableUser[]);
        setTotalUsers(users.totalUsers);
      } else {
        setUsers([]);
      }
    } catch (e) {
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  }, [pagination, orders]);

  const handlePageChange = (newPage: number) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  const handlePaginationChange = (newPagination: {
    page: number;
    pageSize: number;
  }) => {
    setPagination({ ...newPagination });
  };

  const handleOrdersObjChange = (newOrders: OrdersObj) => {
    setOrders(newOrders);
  };

  useEffect(() => {
    void fetchUsers();
  }, [fetchUsers]);
  useEffect(() => {
    searchRef.current = search;
  }, [search]);
  return (
    <div className="flex h-full w-full flex-col gap-2">
      <h3 className="text-2xl font-semibold">Administrar usuarios</h3>
      <div className="flex w-full gap-1">
        <div className="flex w-fit max-w-[90vw] gap-0.5">
          <Input
            className="w-full"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
            }}
            placeholder="Buscar...."
          />
          <Button
            onPress={() => {
              void fetchUsers();
            }}
            className="h-full"
            variant="secondary"
          >
            <IconSearch />
          </Button>
        </div>
      </div>
      {isLoading && (
        <div className="flex justify-center">
          <LoadingIcon className="h-32 w-32" />
        </div>
      )}
      <div className={`${isLoading ? "hidden" : ""} max-h-full overflow-auto`}>
        <UsersTable
          users={users}
          pagination={pagination}
          totalUsers={totalUsers}
          orders={orders}
          handlePageChange={handlePageChange}
          handlePaginationChange={handlePaginationChange}
          handleOrdersObjChange={handleOrdersObjChange}
        />
      </div>
    </div>
  );
};

export default UsersClient;
export type { TableUser };
