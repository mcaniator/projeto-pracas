import { Button } from "@components/button";
import { useUserContext } from "@components/context/UserContext";
import { Checkbox } from "@components/ui/checkbox";
import { Input } from "@components/ui/input";
import {
  IconCheck,
  IconCornerUpLeft,
  IconCornerUpRight,
  IconFilter,
  IconKey,
  IconReload,
  IconSquareFilled,
  IconUser,
  IconUserScan,
  IconX,
} from "@tabler/icons-react";
import Image from "next/image";
import React, { useEffect, useState } from "react";

import DeleteUserModal from "./deleteUserModal";
import SortMenu from "./orderMenu";
import PermissionsModal from "./permissionsModal";
import { TableUser } from "./usersClient";

type Order = "asc" | "desc" | "none";
type OrderProperty = "email" | "name" | "username" | "createdAt";
type OrdersObj = {
  email: Order;
  name: Order;
  username: Order;
  createdAt: Order;
};
const UsersTable = ({
  users,
  totalUsers,
  pagination,
  orders,
  activeUsersFilter,
  handlePageChange,
  handlePaginationChange,
  handleOrdersObjChange,
  handleActiveUsersFilterChange,
  updateTable,
}: {
  users: TableUser[];
  totalUsers: number | null;
  pagination: { page: number; pageSize: number };
  orders: OrdersObj;
  activeUsersFilter: boolean;
  handlePageChange: (newValue: number) => void;
  handlePaginationChange: (newPagination: {
    page: number;
    pageSize: number;
  }) => void;
  handleOrdersObjChange: (newOrders: OrdersObj) => void;
  handleActiveUsersFilterChange: () => void;
  updateTable: () => void;
}) => {
  const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const { user } = useUserContext();
  const [userIsUserManager] = useState(user?.roles.includes("USER_MANAGER"));
  const [isPermissionsModalOpen, setIsPermissionsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [totalPages, setTotalPages] = useState(0);
  const [localPagination, setLocalPagination] = useState({ ...pagination });
  const [selectedUser, setSelectedUser] = useState<TableUser | null>(null);
  const validatePage = (newPage: number) => {
    if (Number.isNaN(localPagination.page)) {
      newPage = 1;
    } else if (localPagination.page < 1) {
      newPage = 1;
    } else if (localPagination.page > totalPages) {
      newPage = totalPages;
    }
    setLocalPagination((prev) => ({ ...prev, page: newPage }));

    handlePageChange(newPage);
  };

  const validatePagination = () => {
    const newPagination = { ...localPagination };
    if (
      Number.isNaN(localPagination.pageSize) ||
      localPagination.pageSize < 1
    ) {
      newPagination.pageSize = 1;
    } else if (totalUsers && localPagination.pageSize > totalUsers) {
      newPagination.pageSize = totalUsers;
    }
    const newTotalPages =
      totalUsers ? Math.ceil(totalUsers / newPagination.pageSize) : 0;
    if (Number.isNaN(localPagination.page) || localPagination.page < 1) {
      newPagination.page = 1;
    } else if (localPagination.page > newTotalPages) {
      newPagination.page = newTotalPages;
    }

    setTotalPages(newTotalPages);
    setLocalPagination(newPagination);

    handlePaginationChange(newPagination);
  };

  const changeOrder = (order: Order, orderProperty: string) => {
    handleOrdersObjChange({ ...orders, [orderProperty]: order });
  };

  useEffect(() => {
    setLocalPagination(pagination);
    const newTotalPages =
      totalUsers ? Math.ceil(totalUsers / pagination.pageSize) : 0;
    setTotalPages(newTotalPages);
  }, [pagination, totalUsers]);
  return (
    <div className="w-full">
      <table className="w-full">
        <thead className="sticky top-0 z-10 bg-gray-900">
          <tr className="bg-gray-400/10">
            <th className="flex items-center justify-center px-6">
              <IconUserScan size={32} />
            </th>
            <th className="px-6">
              <div className="flex items-center gap-1">
                E-mail
                <SortMenu
                  order={orders.email}
                  orderProperty={"email"}
                  changeOrder={changeOrder}
                />
              </div>
            </th>
            <th className="px-6">
              <div className="flex items-center gap-1">
                Nome
                <SortMenu
                  order={orders.name}
                  orderProperty={"name"}
                  changeOrder={changeOrder}
                />
              </div>
            </th>
            <th className="px-6">
              <div className="flex items-center gap-1">
                Nome de usuário
                <SortMenu
                  order={orders.username}
                  orderProperty={"username"}
                  changeOrder={changeOrder}
                />
              </div>
            </th>
            <th className="px-6">
              <div className="flex items-center justify-center gap-1 text-center">
                <label htmlFor="active-filter-checkbox" className="text-center">
                  Ativo?
                </label>
                <Checkbox
                  id="active-filter-checkbox"
                  checked={activeUsersFilter}
                  onChange={handleActiveUsersFilterChange}
                ></Checkbox>
              </div>
            </th>
            <th className="px-6">
              <div className="flex items-center gap-1">
                Registro em
                <SortMenu
                  order={orders.createdAt}
                  orderProperty={"createdAt"}
                  changeOrder={changeOrder}
                />
              </div>
            </th>
            {userIsUserManager && <th>Ações</th>}
          </tr>
        </thead>
        <tbody>
          {users.map((user, index) => (
            <tr
              key={index}
              className={`${index % 2 === 0 ? "bg-gray-400/70" : "bg-gray-400/50"}`}
            >
              <td className="flex justify-center px-6 py-2">
                {user.image ?
                  <Image
                    className="rounded-md"
                    src={user.image}
                    alt="img"
                    width={32}
                    height={32}
                  />
                : <IconUser size={32} />}
              </td>
              <td className="px-6">{user.email}</td>
              <td className="px-6">{user.name}</td>
              <td className="px-6">{user.username}</td>
              <td className={`flex justify-center`}>
                {user.active ?
                  <div className="relative h-6 w-6">
                    <IconSquareFilled className="absolute inset-0 text-green-500" />
                    <IconCheck className="absolute inset-0 p-1 text-white" />
                  </div>
                : <div className="relative h-6 w-6">
                    <IconSquareFilled className="absolute inset-0 text-red-500" />
                    <IconX className="absolute inset-0 p-1 text-white" />
                  </div>
                }
              </td>
              <td className="px-6">{dateFormatter.format(user.createdAt)}</td>
              {userIsUserManager && (
                <td className="flex justify-center gap-1 px-6">
                  <Button
                    className="px-2"
                    onPress={() => {
                      setSelectedUser(user);
                      setIsPermissionsModalOpen(true);
                    }}
                  >
                    <IconKey />
                  </Button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
        <tfoot className="sticky bottom-0 z-10 bg-gray-900">
          <tr>
            <td className="flex items-center justify-center px-6">
              <IconFilter size={32} />
            </td>
            <td className="px-6 font-bold">Página</td>
            <td className="px-6 font-bold">Itens por página</td>
            <td colSpan={4} className="px-6 font-bold">
              Total
            </td>
          </tr>
          <tr>
            <td className="px-6">
              <div className="flex items-center justify-center px-6">
                <Button
                  variant={"secondary"}
                  onPress={() => {
                    validatePagination();
                  }}
                >
                  <IconReload />
                </Button>
              </div>
            </td>
            <td className="flex items-center gap-1 px-6">
              <div className="flex items-center gap-1 text-nowrap">
                <Button
                  variant={"secondary"}
                  isDisabled={localPagination.page <= 1}
                  onPress={() => {
                    validatePage(localPagination.page - 1);
                  }}
                >
                  <IconCornerUpLeft />
                </Button>
                <Input
                  value={
                    Number.isNaN(localPagination.page) ? "" : (
                      localPagination.page
                    )
                  }
                  onChange={(e) => {
                    setLocalPagination((prev) => ({
                      ...prev,
                      page: parseInt(e.target.value),
                    }));
                  }}
                  className={`${
                    localPagination.page < 10 ? "w-10"
                    : localPagination.page < 100 ? "w-12"
                    : "w-14"
                  }`}
                />
                <span className="h-full rounded-lg bg-gray-300/10 p-2">
                  / {totalPages}
                </span>

                <Button
                  variant={"secondary"}
                  isDisabled={localPagination.page >= totalPages}
                  onPress={() => {
                    validatePage(localPagination.page + 1);
                  }}
                >
                  <IconCornerUpRight />
                </Button>
              </div>
            </td>
            <td className="px-6">
              <Input
                value={
                  Number.isNaN(localPagination.pageSize) ? "" : (
                    localPagination.pageSize
                  )
                }
                onChange={(e) => {
                  setLocalPagination((prev) => ({
                    ...prev,
                    pageSize: parseInt(e.target.value),
                  }));
                }}
                className={`${
                  localPagination.pageSize < 10 ? "w-10"
                  : localPagination.pageSize < 100 ? "w-12"
                  : "w-14"
                }`}
              />
            </td>
            <td colSpan={4} className="px-6">
              {totalUsers ?? 0}
            </td>
          </tr>
        </tfoot>
      </table>
      <PermissionsModal
        isOpen={isPermissionsModalOpen}
        user={selectedUser}
        onOpenChange={() => {
          setIsPermissionsModalOpen(false);
        }}
        deleteUser={() => {
          setIsPermissionsModalOpen(false);
          setIsDeleteModalOpen(true);
        }}
        updateTable={updateTable}
      />
      {selectedUser && (
        <DeleteUserModal
          isOpen={isDeleteModalOpen}
          user={selectedUser}
          onOpenChange={() => {
            setIsDeleteModalOpen(false);
          }}
          updateTable={updateTable}
        />
      )}
    </div>
  );
};

export default UsersTable;
export { type Order, type OrdersObj, type OrderProperty };
