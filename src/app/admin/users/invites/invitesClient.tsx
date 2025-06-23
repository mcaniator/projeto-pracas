"use client";

import { Role } from "@prisma/client";
import { IconSearch, IconUserPlus } from "@tabler/icons-react";
import { useCallback, useEffect, useRef, useState } from "react";

import LoadingIcon from "../../../../components/LoadingIcon";
import { Button } from "../../../../components/button";
import { Input } from "../../../../components/ui/input";
import { getInvites } from "../../../../serverActions/inviteUtil";
import InviteCRUDModal from "./inviteCRUDModal";
import InvitesTable, { InviteOrdersObj } from "./invitesTable";

type Invite = {
  email: string;
  token: string;
  roles: Role[];
  createdAt: Date;
  expiresAt: Date;
};

const InvitesClient = () => {
  const [search, setSearch] = useState<string>("");
  const searchRef = useRef("");
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [selectedInvite, setSelectedInvite] = useState<Invite | null>(null);
  const [pagination, setPagination] = useState<{
    page: number;
    pageSize: number;
  }>({
    page: 1,
    pageSize: 10,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [totalInvites, setTotalInvites] = useState<number | null>(null);
  const [orders, setOrders] = useState<InviteOrdersObj>({
    email: "none",
    createdAt: "desc",
  });

  const fetchInvites = useCallback(async () => {
    setIsLoading(true);
    try {
      const invites = await getInvites(
        pagination.page,
        pagination.pageSize,
        searchRef.current,
        orders,
      );
      if (invites.statusCode === 200) {
        setInvites(invites.invites ?? []);
        setTotalInvites(invites.totalInvites);
      } else {
        setInvites([]);
      }
    } catch (e) {
      setInvites([]);
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

  const handleOrdersObjChange = (newOrders: InviteOrdersObj) => {
    setOrders(newOrders);
  };

  const updateTable = () => {
    void fetchInvites();
  };

  useEffect(() => {
    void fetchInvites();
  }, [fetchInvites]);

  useEffect(() => {
    searchRef.current = search;
  }, [search]);
  return (
    <div className="flex h-full w-full flex-col gap-2">
      <h3 className="text-2xl font-semibold">Convites de usuário</h3>
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
        <Button
          className="h-full"
          onPress={() => {
            setSelectedInvite(null);
            setIsInviteModalOpen(true);
          }}
        >
          <IconUserPlus className="h-6 w-6" />
        </Button>
      </div>
      {isLoading && (
        <div className="flex justify-center">
          <LoadingIcon className="h-32 w-32" />
        </div>
      )}
      <div className={`${isLoading ? "hidden" : ""} max-h-full overflow-auto`}>
        <InvitesTable
          invites={invites}
          pagination={pagination}
          totalInvites={totalInvites}
          orders={orders}
          handlePageChange={handlePageChange}
          handleOrdersObjChange={handleOrdersObjChange}
          handlePaginationChange={handlePaginationChange}
          updateTable={updateTable}
        />
      </div>

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

export default InvitesClient;
export type { Invite };
