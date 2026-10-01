"use client";

import PermissionGuard from "@/components/auth/permissionGuard";
import { useNetwork } from "@/components/context/networkContext";
import CButton from "@/components/ui/cButton";
import CDialog from "@/components/ui/dialog/cDialog";
import CMenu from "@/components/ui/menu/cMenu";
import { dateTimeWithoutSecondsFormater } from "@/lib/formatters/dateFormatters";
import { useFetchForms } from "@/lib/serverFunctions/apiCalls/form";
import { FetchFormsResponse } from "@/lib/serverFunctions/queries/form";
import { Chip, Radio, useMediaQuery, useTheme } from "@mui/material";
import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import type { FormUse } from "@prisma/client";
import {
  IconCopy,
  IconEye,
  IconPencil,
  IconPlus,
  IconTrashX,
} from "@tabler/icons-react";
import { useCallback, useEffect, useState } from "react";
import { FaTrashRestore } from "react-icons/fa";

import FormEditor from "../formEditor";
import FormArchiveDialog from "./formArchiveDialog";
import FormCreationDialog from "./formCreationDialog";

type FormRow = FetchFormsResponse["forms"][number];

const FormManager = ({
  formUse,
  title,
  value,
  onValueChange,
}: {
  formUse: FormUse;
  title?: string;
  value?: number;
  onValueChange?: (value: number) => void;
}) => {
  const theme = useTheme();
  const { isConnected } = useNetwork();
  const isMobileView = useMediaQuery(theme.breakpoints.down("lg"));
  const [_fetchForms, loading] = useFetchForms({
    callbacks: {
      onSuccess: ({ data }) => {
        if (data) {
          setForms(data.forms);
        }
      },
    },
  });

  const loadForms = useCallback(
    ({ invalidateCache }: { invalidateCache?: boolean } = {}) => {
      void _fetchForms({
        params: { formUse, includeArchived: true },
        requestOptions: {
          cache: invalidateCache ? "reload" : "default",
        },
      });
    },
    [_fetchForms, formUse],
  );

  useEffect(() => {
    void loadForms();
  }, [loadForms]);

  const [forms, setForms] = useState<FetchFormsResponse["forms"]>([]);
  const [openFormCreationDialog, setOpenFormCreationDialog] = useState(false);
  const [openFormArchiveDialog, setOpenFormArchiveDialog] = useState(false);
  const [openFormEditorDialog, setOpenFormEditorDialog] = useState(false);
  const [selectedFormId, setSelectedFormId] = useState<number>();
  const [needsListReload, setNeedsListReload] = useState(false);
  const [selectedForm, setSelectedForm] = useState<{
    id: number;
    name: string;
    archived: boolean;
    finalized: boolean;
  }>();

  useEffect(() => {
    if (openFormEditorDialog || !needsListReload) return;

    loadForms({ invalidateCache: true });
    setNeedsListReload(false);
  }, [loadForms, needsListReload, openFormEditorDialog]);

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

  const handleOpenFormEditor = (formId: number) => {
    setSelectedFormId(formId);
    setOpenFormEditorDialog(true);
  };

  const handleCloseFormEditor = () => {
    setOpenFormEditorDialog(false);
  };

  const columns: GridColDef<FormRow>[] = [
    {
      field: "Ações",
      headerName: "",
      width: value === undefined ? 80 : 130,
      sortable: false,
      filterable: false,
      hideable: false,
      renderCell: (params: GridRenderCellParams<FormRow>) => (
        <div className="flex h-full items-center">
          {value !== undefined && (
            <Radio
              checked={params.row.id === value}
              inputProps={{
                "aria-label": `Selecionar formulário ${params.row.name}`,
              }}
              onChange={() => {
                if (params.row.id !== value) {
                  onValueChange?.(params.row.id);
                }
              }}
            />
          )}
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
                onClick: () => handleOpenFormEditor(params.row.id),
              },
              {
                label: (
                  <div className="flex items-center">
                    <IconCopy />
                    Clonar
                  </div>
                ),
                disabled: !isConnected,
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
                        Excluir
                      </>
                    }
                  </div>
                ),
                disabled: !isConnected,
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
        </div>
      ),
    },
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
      field: "assessmentsCount",
      headerName: "Avaliações",
      width: 100,
      align: "center",
      renderCell: (params: GridRenderCellParams<FormRow>) =>
        params.row._count.assessment,
    },
    {
      field: "updatedAt",
      headerName: "Última edição",
      width: 180,
      renderCell: (params: GridRenderCellParams<FormRow>) =>
        dateTimeWithoutSecondsFormater.format(params.row.updatedAt),
    },
  ];

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <div
        className={`flex items-center gap-2 ${title ? "justify-between" : "justify-end"}`}
      >
        {title && <h2 className="text-xl font-semibold">{title}</h2>}
        <PermissionGuard requiresAnyRoles={["PROTOCOL_MANAGER"]}>
          <CButton
            square={isMobileView}
            disabled={!isConnected}
            tooltip={isConnected ? "" : "Conecte-se para criar um formulário"}
            onClick={() => {
              setSelectedForm(undefined);
              setOpenFormCreationDialog(true);
            }}
          >
            <IconPlus /> {isMobileView ? "" : "Criar"}
          </CButton>
        </PermissionGuard>
      </div>

      <DataGrid
        className="min-h-0 flex-1"
        loading={loading}
        rows={forms}
        columns={columns}
        autoHeight={false}
        rowSelection={false}
      />

      <CDialog
        title="Formulário"
        fullScreen
        disableDialogActions
        open={openFormEditorDialog}
        onClose={handleCloseFormEditor}
      >
        {selectedFormId !== undefined && (
          <FormEditor
            formId={selectedFormId}
            formUse={formUse}
            onSave={(finalized) => {
              setNeedsListReload(true);
              if (finalized) setOpenFormEditorDialog(false);
            }}
          />
        )}
      </CDialog>

      <FormCreationDialog
        open={openFormCreationDialog}
        formUse={formUse}
        cloneForm={selectedForm}
        reloadForms={() => {
          loadForms({ invalidateCache: true });
        }}
        onClose={() => setOpenFormCreationDialog(false)}
      />
      <FormArchiveDialog
        open={openFormArchiveDialog}
        onClose={() => setOpenFormArchiveDialog(false)}
        reloadForms={() => {
          loadForms({ invalidateCache: true });
        }}
        formToArchive={selectedForm}
      />
    </div>
  );
};

export default FormManager;
