"use client";

import ArchiveUserDialog from "@/app/admin/users/archiveUserDialog";
import PermissionsDialog from "@/app/admin/users/permissionsDialog";
import CImage from "@/components/ui/CImage";
import CAdminHeader from "@/components/ui/cAdminHeader";
import CButton from "@/components/ui/cButton";
import CCheckbox from "@/components/ui/cCheckbox";
import CMenu from "@/components/ui/menu/cMenu";
import { dateTimeFormatter } from "@/lib/formatters/dateFormatters";
import { useFetchUsers } from "@/lib/serverFunctions/apiCalls/user";
import { FetchUsersResponse } from "@/lib/serverFunctions/queries/user";
import PermissionGuard from "@components/auth/permissionGuard";
import { Stack } from "@mui/material";
import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { IconPencil, IconTrashX, IconUser } from "@tabler/icons-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { AiOutlineUsergroupAdd } from "react-icons/ai";
import { FaTrashRestore } from "react-icons/fa";

type FormRow = FetchUsersResponse["users"][number];

const UsersClient = () => {
  const [openPermissionsDialog, setOpenPermissionsDialog] = useState(false);
  const [openArchiveDialog, setOpenArchiveDialog] = useState(false);
  const [users, setUsers] = useState<FormRow[]>([]);
  const [selectedUser, setSelectedUser] = useState<FormRow | null>(null);
  const [_fetchUsers, loading] = useFetchUsers({
    callbacks: {
      onSuccess: ({ data }) => {
        setUsers(data?.users ?? []);
      },
    },
  });
  useEffect(() => {
    void _fetchUsers({});
  }, []);

  // Datagrid config
  const columns: GridColDef<FormRow>[] = [
    {
      field: "image",
      headerName: "",
      width: 50,
      sortable: false,
      hideable: false,
      filterable: false,
      renderCell: (params: GridRenderCellParams<FormRow>) => (
        <CImage
          height={80}
          width={80}
          src={params.row.image}
          alt=""
          fallback={
            <div className="mt-4 flex items-center justify-start">
              <IconUser />
            </div>
          }
        />
      ),
    },
    {
      field: "name",
      headerName: "Nome",
      flex: 1,
      minWidth: 150,
    },
    {
      field: "username",
      headerName: "Nome de usuário",
      width: 180,
    },
    {
      field: "email",
      headerName: "E-mail",
      width: 180,
    },
    {
      field: "active",
      headerName: "Ativo",
      width: 60,
      align: "center",
      renderCell(params: GridRenderCellParams<FormRow>) {
        return <CCheckbox checked={params.row.active} readOnly />;
      },
    },
    {
      field: "updatedAt",
      headerName: "Atualizado em",
      width: 180,
      renderCell: (params: GridRenderCellParams<FormRow>) => {
        return dateTimeFormatter.format(new Date(params.row.updatedAt));
      },
    },
    {
      field: "createdAt",
      headerName: "Registrado em",
      width: 180,
      renderCell: (params: GridRenderCellParams<FormRow>) => {
        return dateTimeFormatter.format(new Date(params.row.createdAt));
      },
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
                    setSelectedUser(params.row);
                    setOpenPermissionsDialog(true);
                  },
                },
                {
                  label: (
                    <div className="flex items-center">
                      {params.row.active ?
                        <>
                          <IconTrashX />
                          Arquivar
                        </>
                      : <>
                          <FaTrashRestore /> Restaurar
                        </>
                      }
                    </div>
                  ),
                  onClick: () => {
                    setSelectedUser(params.row);
                    setOpenArchiveDialog(true);
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
    <div className="flex h-full w-full flex-col bg-white p-2 text-black">
      <CAdminHeader
        titleIcon={<IconUser />}
        title="Admininstrar Usuários"
        append={
          <PermissionGuard requiresAnyRoles={["USER_MANAGER"]}>
            <Link href="/admin/users/invites">
              <CButton>
                <AiOutlineUsergroupAdd size={26} />
              </CButton>
            </Link>
          </PermissionGuard>
        }
      />
      <DataGrid
        columns={columns}
        rows={users}
        rowSelection={false}
        loading={loading}
      />
      {selectedUser && (
        <>
          <PermissionsDialog
            open={openPermissionsDialog}
            onClose={() => {
              setOpenPermissionsDialog(false);
              setSelectedUser(null);
            }}
            user={selectedUser}
            updateTable={() => {
              void _fetchUsers({});
            }}
          />
          <ArchiveUserDialog
            open={openArchiveDialog}
            onClose={() => {
              setOpenArchiveDialog(false);
              setSelectedUser(null);
            }}
            user={selectedUser}
            updateTable={() => {
              void _fetchUsers({});
            }}
          />
        </>
      )}
    </div>
  );
};

export default UsersClient;
