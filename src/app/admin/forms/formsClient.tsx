"use client";

import FormArchiveDialog from "@/app/admin/forms/formArchiveDialog";
import FormCreationDialog from "@/app/admin/forms/formCreationDialog";
import PermissionGuard from "@/components/auth/permissionGuard";
import CAdminHeader from "@/components/ui/cAdminHeader";
import CButton from "@/components/ui/cButton";
import CMenu from "@/components/ui/menu/cMenu";
import { dateTimeWithoutSecondsFormater } from "@/lib/formatters/dateFormatters";
import { useFetchForms } from "@/lib/serverFunctions/apiCalls/form";
import { FetchFormsResponse } from "@/lib/serverFunctions/queries/form";
import { Chip } from "@mui/material";
import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import {
  IconClipboard,
  IconCopy,
  IconEye,
  IconPencil,
  IconPlus,
  IconTrashX,
} from "@tabler/icons-react";
import { useCallback, useEffect, useState } from "react";
import { FaTrashRestore } from "react-icons/fa";

type FormRow = FetchFormsResponse["forms"][number];

const FormsClient = () => {
  const [_fetchForms, loading] = useFetchForms({
    callbacks: {
      onSuccess: ({ data }) => {
        if (data) {
          setForms(data.forms);
        }
      },
    },
  });

  const loadForms = useCallback(() => {
    void _fetchForms({ includeArchived: true });
  }, [_fetchForms]);

  useEffect(() => {
    void loadForms();
  }, [loadForms]);

  const [forms, setForms] = useState<FetchFormsResponse["forms"]>([]);
  const [openFormCreationDialog, setOpenFormCreationDialog] = useState(false);
  const [openFormArchiveDialog, setOpenFormArchiveDialog] = useState(false);
  const [selectedForm, setSelectedForm] = useState<{
    id: number;
    name: string;
    archived: boolean;
    finalized: boolean;
  }>();

  const handleClone = (cloneForm: {
    id: number;
    name: string;
    archived: boolean;
    finalized: boolean;
  }) => {
    setSelectedForm(cloneForm);
    setOpenFormCreationDialog(true);
  };

  const handleArchive = (formToArchive: {
    id: number;
    name: string;
    archived: boolean;
    finalized: boolean;
  }) => {
    setSelectedForm(formToArchive);
    setOpenFormArchiveDialog(true);
  };

  const columns: GridColDef<FormRow>[] = [
    {
      field: "name",
      headerName: "Nome",
      flex: 1,
      minWidth: 150,
    },
    {
      field: "status",
      headerName: "Status",
      width: 150,
      valueGetter: (value, row) =>
        row.archived ? "Arquivado"
        : row.finalized ? "Finalizado"
        : "Em construção",
      renderCell: (params: GridRenderCellParams<FormRow>) => (
        <Chip
          sx={{ width: "120px" }}
          color={
            params.row.archived ? "error"
            : params.row.finalized ?
              "primary"
            : "info"
          }
          label={
            params.row.archived ? "Arquivado"
            : params.row.finalized ?
              "Finalizado"
            : "Em construção"
          }
        />
      ),
    },
    {
      field: "updatedAt",
      headerName: "Última edição",
      width: 180,
      renderCell: (params: GridRenderCellParams<FormRow>) =>
        dateTimeWithoutSecondsFormater.format(new Date(params.row.updatedAt)),
    },
    {
      field: "Ações",
      headerName: "",
      width: 80,
      sortable: false,
      filterable: false,
      hideable: false,
      renderCell: (params: GridRenderCellParams<FormRow>) => (
        <CMenu
          options={[
            {
              label:
                params.row.finalized ?
                  <div className="flex items-center">
                    <IconEye />
                    Ver
                  </div>
                : <div className="flex items-center">
                    <IconPencil />
                    Editar
                  </div>,
              href: `/admin/forms/${params.row.id}/edit`,
            },
            {
              label: (
                <div className="flex items-center">
                  <IconCopy />
                  Clonar
                </div>
              ),
              onClick: () => {
                handleClone({
                  id: params.row.id,
                  name: params.row.name,
                  archived: params.row.archived,
                  finalized: params.row.finalized,
                });
              },
            },
            {
              label: (
                <div className="flex items-center">
                  {params.row.archived ?
                    <>
                      <FaTrashRestore /> Restaurar
                    </>
                  : <>
                      <IconTrashX />
                      Arquivar
                    </>
                  }
                </div>
              ),
              sx: {
                color: "red",
              },
              onClick: () => {
                handleArchive({
                  id: params.row.id,
                  name: params.row.name,
                  archived: params.row.archived,
                  finalized: params.row.finalized,
                });
              },
            },
          ]}
        />
      ),
    },
  ];

  return (
    <div
      className={
        "flex h-full min-h-0 w-full flex-col gap-5 overflow-auto bg-white p-2 text-black"
      }
    >
      <CAdminHeader
        titleIcon={<IconClipboard />}
        title="Formulários"
        append={
          <PermissionGuard requiresAnyRoles={["FORM_MANAGER"]}>
            <CButton
              onClick={() => {
                setSelectedForm(undefined);
                setOpenFormCreationDialog(true);
              }}
            >
              <IconPlus /> Criar
            </CButton>
          </PermissionGuard>
        }
      />

      <DataGrid
        loading={loading}
        rows={forms}
        columns={columns}
        autoHeight={false}
      />

      <FormCreationDialog
        open={openFormCreationDialog}
        cloneForm={selectedForm}
        reloadForms={loadForms}
        onClose={() => setOpenFormCreationDialog(false)}
      />
      <FormArchiveDialog
        open={openFormArchiveDialog}
        onClose={() => setOpenFormArchiveDialog(false)}
        reloadForms={loadForms}
        formToArchive={selectedForm}
      />
    </div>
  );
};

export default FormsClient;
