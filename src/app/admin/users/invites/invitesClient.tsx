"use client";

import { Role } from "@prisma/client";
import { IconSearch, IconUserPlus } from "@tabler/icons-react";
import { set } from "ol/transform";
import { useState } from "react";

import { Button } from "../../../../components/button";
import { Input } from "../../../../components/ui/input";
import InviteModal from "./inviteModal";

type Invite = {
  email: string;
  token: string;
  roles: Role[];
  createdAt: Date;
  expiresAt: Date;
};

const InvitesClient = () => {
  const [search, setSearch] = useState<string>("");
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
      <InviteModal
        isOpen={isInviteModalOpen}
        invite={selectedInvite}
        onOpenChange={() => {
          setIsInviteModalOpen(false);
        }}
        updateTable={() => {
          console.log("UPDATE TABLE");
        }}
      />
    </div>
  );
};

export default InvitesClient;
export type { Invite };
