"use client";

import CreateInviteDialog from "@/app/admin/users/invites/createInviteDialog";
import DeleteInviteDialog from "@/app/admin/users/invites/deleteInviteDialog";
import CAdminHeader from "@/components/ui/cAdminHeader";
import CButton from "@/components/ui/cButton";
import CMenu from "@/components/ui/menu/cMenu";
import { useFetchInvites } from "@/lib/serverFunctions/apiCalls/invite";
import { FetchInvitesResponse } from "@/lib/serverFunctions/queries/invite";
import { Stack } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { Role } from "@prisma/client";
import {
  IconMail,
  IconPencil,
  IconTrashX,
  IconUserPlus,
} from "@tabler/icons-react";
import { useEffect, useState } from "react";

type Invite = {
  email: string;
  token: string;
  roles: Role[];
  createdAt: Date;
  expiresAt: Date;
};
type FormRow = FetchInvitesResponse["invites"][number];
const InvitesClient = () => {
  const [openCreateInviteDialog, setOpenCreateInviteDialog] = useState(false);
  const [openDeleteInviteDialog, setOpenDeleteInviteDialog] = useState(false);
  const [invites, setInvites] = useState<FormRow[]>([]);
  const [selectedInvite, setSelectedInvite] = useState<FormRow | null>(null);

  const [_fetchInvites, loading] = useFetchInvites({
    callbacks: {
      onSuccess(response) {
        setInvites(response.data?.invites ?? []);
      },
    },
  });

  useEffect(() => {
    void _fetchInvites({});
  }, []);

  //Datagrid config
  const columns: GridColDef<FormRow>[] = [
    {
      field: "email",
      headerName: "Email",
      flex: 1,
      minWidth: 150,
    },
    {
      field: "expiresAt",
      headerName: "Expira em",
      width: 180,
    },
    {
      field: "updatedAt",
      headerName: "Atualizado em",
      width: 180,
    },
    {
      field: "Ações",
      headerName: "",
      filterable: false,
      sortable: false,
      align: "center",
      renderCell: (params: GridRenderCellParams<FormRow>) => {
        return (
          <Stack
            direction="row"
            spacing={1}
            alignItems={"center"}
            height={"100%"}
          >
            <CMenu
              options={[
                {
                  label: (
                    <div className="flex items-center gap-2">
                      <IconPencil /> Editar
                    </div>
                  ),
                  onClick: () => {
                    setSelectedInvite(params.row);
                    setOpenCreateInviteDialog(true);
                  },
                },
                {
                  label: (
                    <div className="flex items-center gap-2">
                      <IconTrashX />
                      Excluir
                    </div>
                  ),
                  onClick: () => {
                    setSelectedInvite(params.row);
                    setOpenDeleteInviteDialog(true);
                  },
                  sx: {
                    color: "red",
                  },
                },
              ]}
            />
          </Stack>
        );
      },
    },
  ];
  return (
    <div className="flex h-full w-full flex-col gap-2 bg-white p-2 text-black">
      <CAdminHeader
        titleIcon={<IconMail />}
        title="Convites de usuário"
        append={
          <CButton
            onClick={() => {
              setOpenCreateInviteDialog(true);
              setSelectedInvite(null);
            }}
          >
            <IconUserPlus size={28} />
          </CButton>
        }
      />
      <DataGrid
        columns={columns}
        rows={invites}
        rowSelection={false}
        loading={loading}
      />
      <CreateInviteDialog
        open={openCreateInviteDialog}
        onClose={() => {
          setOpenCreateInviteDialog(false);
        }}
        updateTable={() => {
          void _fetchInvites({});
        }}
        invite={selectedInvite ?? undefined}
      />
      {selectedInvite && (
        <DeleteInviteDialog
          open={openDeleteInviteDialog}
          onClose={() => {
            setOpenDeleteInviteDialog(false);
            setSelectedInvite(null);
          }}
          invite={selectedInvite ?? undefined}
          updateTable={() => {
            void _fetchInvites({});
          }}
        />
      )}
    </div>
  );
};

export default InvitesClient;
export type { Invite };
