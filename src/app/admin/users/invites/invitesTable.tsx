"use client";

import {
  IconCornerUpLeft,
  IconCornerUpRight,
  IconEdit,
  IconFilter,
  IconReload,
} from "@tabler/icons-react";
import { useEffect, useState } from "react";

import { Button } from "../../../../components/button";
import { Input } from "../../../../components/ui/input";
import SortMenu from "../orderMenu";
import { Order } from "../usersTable";
import InviteCRUDModal from "./inviteCRUDModal";
import { Invite } from "./invitesClient";

type InviteOrdersObj = {
  email: Order;
  createdAt: Order;
};

const InvitesTable = ({
  invites,
  totalInvites,
  pagination,
  orders,
  handlePageChange,
  handlePaginationChange,
  handleOrdersObjChange,
  updateTable,
}: {
  invites: Invite[];
  totalInvites: number | null;
  pagination: { page: number; pageSize: number };
  orders: InviteOrdersObj;
  handlePageChange: (newValue: number) => void;
  handlePaginationChange: (newPagination: {
    page: number;
    pageSize: number;
  }) => void;
  handleOrdersObjChange: (newOrders: InviteOrdersObj) => void;
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
  const [totalPages, setTotalPages] = useState(0);
  const [selectedInvite, setSelectedInvite] = useState<Invite | null>(null);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  const changeOrder = (order: Order, orderProperty: string) => {
    handleOrdersObjChange({ ...orders, [orderProperty]: order });
  };
  const [localPagination, setLocalPagination] = useState({ ...pagination });
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
    } else if (totalInvites && localPagination.pageSize > totalInvites) {
      newPagination.pageSize = totalInvites;
    }
    const newTotalPages =
      totalInvites ? Math.ceil(totalInvites / newPagination.pageSize) : 0;
    if (Number.isNaN(localPagination.page) || localPagination.page < 1) {
      newPagination.page = 1;
    } else if (localPagination.page > newTotalPages) {
      newPagination.page = newTotalPages;
    }

    setTotalPages(newTotalPages);
    setLocalPagination(newPagination);

    handlePaginationChange(newPagination);
  };

  useEffect(() => {
    setLocalPagination(pagination);
    const newTotalPages =
      totalInvites ? Math.ceil(totalInvites / pagination.pageSize) : 0;
    setTotalPages(newTotalPages);
  }, [pagination, totalInvites]);
  return (
    <div className="w-full">
      <table className="w-full">
        <thead className="sticky top-0 z-10 bg-gray-900">
          <tr className="bg-gray-400/10">
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
                Registro em
                <SortMenu
                  order={orders.createdAt}
                  orderProperty={"createdAt"}
                  changeOrder={changeOrder}
                />
              </div>
            </th>
            <th className="px-6">
              <div className="flex items-center gap-1">Exipira em</div>
            </th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {invites.map((invite, index) => (
            <tr
              key={index}
              className={`${index % 2 === 0 ? "bg-gray-400/70" : "bg-gray-400/50"}`}
            >
              <td className="px-6">{invite.email}</td>
              <td className="px-6">{dateFormatter.format(invite.createdAt)}</td>
              <td className="px-6">{dateFormatter.format(invite.expiresAt)}</td>
              <td className="flex justify-center gap-1 px-6">
                <Button
                  className="px-2"
                  onPress={() => {
                    setSelectedInvite(invite);
                    setIsInviteModalOpen(true);
                  }}
                >
                  <IconEdit />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot className="sticky bottom-0 z-10 bg-gray-900">
          <tr className="">
            <td colSpan={4}>
              <div className="grid gap-1 pl-4 [grid-template-columns:0.15fr_1fr_1fr_1fr]">
                <IconFilter className="w-fit pl-3" size={32} />

                <div className="font-bold">Página</div>
                <div className="font-bold">Itens por página</div>
                <div className="font-bold">Total</div>
                <Button
                  className="w-fit"
                  variant={"secondary"}
                  onPress={() => {
                    validatePagination();
                  }}
                >
                  <IconReload />
                </Button>
                <div className="flex gap-1">
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
                <div>{totalInvites}</div>
              </div>
            </td>
          </tr>
        </tfoot>
      </table>
      <InviteCRUDModal
        isOpen={isInviteModalOpen}
        inviteProp={selectedInvite}
        onOpenChange={() => {
          setIsInviteModalOpen(false);
        }}
        updateTable={updateTable}
      />
    </div>
  );
};

export default InvitesTable;
export type { InviteOrdersObj };
