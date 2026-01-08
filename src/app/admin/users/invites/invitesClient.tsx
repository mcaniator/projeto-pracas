"use client";

import CAdminHeader from "@/components/ui/cAdminHeader";
import CButton from "@/components/ui/cButton";
import LoadingIcon from "@components/LoadingIcon";
import { Button } from "@components/button";
import { useHelperCard } from "@components/context/helperCardContext";
import { useLoadingOverlay } from "@components/context/loadingContext";
import CustomModal from "@components/modal/customModal";
import { Input } from "@components/ui/input";
import { Role } from "@prisma/client";
import { _deleteInvite, _getInvites } from "@serverActions/inviteUtil";
import { IconMail, IconSearch, IconUserPlus } from "@tabler/icons-react";
import { useCallback, useEffect, useRef, useState } from "react";

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
  const { setLoadingOverlayVisible } = useLoadingOverlay();
  const { setHelperCard } = useHelperCard();
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
  const [isDeletionInviteModalOpen, setIsDeletionInviteModalOpen] =
    useState(false);

  const fetchInvites = useCallback(async () => {
    setIsLoading(true);
    try {
      const invites = await _getInvites(
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

  const handleDeleteInvite = async () => {
    try {
      setLoadingOverlayVisible(true);
      if (!selectedInvite) {
        return;
      }
      const response = await _deleteInvite(selectedInvite.token);
      if (response.statusCode === 200) {
        setHelperCard({
          show: true,
          helperCardType: "CONFIRM",
          content: <>Convite excluído!</>,
        });
        updateTable();
        setIsDeletionInviteModalOpen(false);
      } else if (response.statusCode === 401) {
        setHelperCard({
          show: true,
          helperCardType: "ERROR",
          content: <>Sem permissão para excluir convites!</>,
        });
      } else {
        setHelperCard({
          show: true,
          helperCardType: "ERROR",
          content: <>Erro ao excluir convite!</>,
        });
      }
    } catch (e) {
      setHelperCard({
        show: true,
        helperCardType: "ERROR",
        content: <>Erro ao excluir convite!</>,
      });
    } finally {
      setLoadingOverlayVisible(false);
    }
  };

  const openInviteModal = (invite: Invite) => {
    setSelectedInvite(invite);
    setIsInviteModalOpen(true);
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
      <div className="text-black">
        <CAdminHeader
          titleIcon={<IconMail />}
          title="Convites de usuário"
          append={
            <CButton
              onClick={() => {
                setSelectedInvite(null);
                setIsInviteModalOpen(true);
              }}
            >
              <IconUserPlus size={28} />
            </CButton>
          }
        />
      </div>

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
          openInviteModal={openInviteModal}
        />
      </div>

      <InviteCRUDModal
        isOpen={isInviteModalOpen}
        inviteProp={selectedInvite}
        onOpenChange={() => {
          setIsInviteModalOpen(false);
        }}
        openInviteDeletionModal={() => {
          setIsInviteModalOpen(false);
          setIsDeletionInviteModalOpen(true);
        }}
        updateTable={updateTable}
      />
      <CustomModal
        isOpen={isDeletionInviteModalOpen}
        title={"Excluir convite"}
        subtitle={selectedInvite?.email}
        confirmVariant="destructive"
        confirmLabel="Excluir"
        onConfirm={() => {
          void handleDeleteInvite();
        }}
        onOpenChange={(e) => {
          setIsDeletionInviteModalOpen(e);
        }}
      />
    </div>
  );
};

export default InvitesClient;
export type { Invite };
