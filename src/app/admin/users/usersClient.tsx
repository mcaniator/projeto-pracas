"use client";

import { Role } from "@prisma/client";
import { IconSearch } from "@tabler/icons-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { AiOutlineUsergroupAdd } from "react-icons/ai";

import LoadingIcon from "../../../components/LoadingIcon";
import { Button } from "../../../components/button";
import ButtonLink from "../../../components/ui/buttonLink";
import { Input } from "../../../components/ui/input";
import { getUsers } from "../../../serverActions/userUtil";
import UsersTable, { OrdersObj } from "./usersTable";

type TableUser = {
  id: string;
  image: string | null;
  username?: string | null;
  email: string;
  name: string | null;
  active: boolean;
  createdAt: Date;
  roles: Role[];
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
  const [activeUsersFilter, setActiveUsersFilter] = useState(true);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const users = await getUsers(
        pagination.page,
        pagination.pageSize,
        searchRef.current,
        orders,
        activeUsersFilter,
      );
      if (users.statusCode === 200) {
        setUsers(users.users ?? []);
        setTotalUsers(users.totalUsers);
      } else {
        setUsers([]);
      }
    } catch (e) {
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  }, [pagination, orders, activeUsersFilter]);

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

  const handleActiveUsersFilterChange = () => {
    setActiveUsersFilter((prev) => !prev);
  };

  const updateTable = () => {
    void fetchUsers();
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
      <div className="flex w-full justify-between gap-1">
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
              setPagination((prev) => ({ page: 1, pageSize: prev.pageSize }));
            }}
            className="h-full"
            variant="secondary"
          >
            <IconSearch />
          </Button>
        </div>
        <ButtonLink href="/admin/users/invites" className="h-full">
          <AiOutlineUsergroupAdd className="h-6 w-6" />
        </ButtonLink>
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
          activeUsersFilter={activeUsersFilter}
          handlePageChange={handlePageChange}
          handlePaginationChange={handlePaginationChange}
          handleOrdersObjChange={handleOrdersObjChange}
          handleActiveUsersFilterChange={handleActiveUsersFilterChange}
          updateTable={updateTable}
        />
      </div>
    </div>
  );
};

export default UsersClient;
export type { TableUser };
