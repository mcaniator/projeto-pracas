"use client";

import ModularTallyTemplateArchiveDialog from "@/app/admin/protocols/tallys/modularTallyTemplateArchiveDialog";
import ModularTallyTemplateCreationDialog from "@/app/admin/protocols/tallys/modularTallyTemplateCreationDialog";
import PermissionGuard from "@/components/auth/permissionGuard";
import { useNetwork } from "@/components/context/networkContext";
import CButton from "@/components/ui/cButton";
import CMenu from "@/components/ui/menu/cMenu";
import { dateTimeWithoutSecondsFormater } from "@/lib/formatters/dateFormatters";
import { useFetchModularTallyTemplates } from "@/lib/serverFunctions/apiCalls/modularTally";
import { FetchModularTallyTemplatesResponse } from "@/lib/serverFunctions/queries/modularTally";
import { Chip, useMediaQuery, useTheme } from "@mui/material";
import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import {
  IconCopy,
  IconEye,
  IconPencil,
  IconPlus,
  IconTrashX,
} from "@tabler/icons-react";
import { useCallback, useEffect, useState } from "react";
import { FaTrashRestore } from "react-icons/fa";

type ModularTallyTemplateRow =
  FetchModularTallyTemplatesResponse["modularTallyTemplates"][number];

const TallyProtocols = () => {
  const theme = useTheme();
  const { isConnected } = useNetwork();
  const isMobileView = useMediaQuery(theme.breakpoints.down("lg"));
  const [_fetchModularTallyTemplates, loading] =
    useFetchModularTallyTemplates({
      callbacks: {
        onSuccess: ({ data }) => {
          if (data) {
            setModularTallyTemplates(data.modularTallyTemplates);
          }
        },
      },
    });

  const loadModularTallyTemplates = useCallback(
    ({ invalidateCache }: { invalidateCache?: boolean } = {}) => {
      void _fetchModularTallyTemplates({
        params: { includeArchived: true },
        requestOptions: {
          cache: invalidateCache ? "reload" : "default",
        },
      });
    },
    [_fetchModularTallyTemplates],
  );

  useEffect(() => {
    void loadModularTallyTemplates();
  }, [loadModularTallyTemplates]);

  const [modularTallyTemplates, setModularTallyTemplates] = useState<
    FetchModularTallyTemplatesResponse["modularTallyTemplates"]
  >([]);
  const [openCreationDialog, setOpenCreationDialog] = useState(false);
  const [openArchiveDialog, setOpenArchiveDialog] = useState(false);
  const [selectedModularTallyTemplate, setSelectedModularTallyTemplate] =
    useState<{
      id: number;
      name: string;
      archived: boolean;
      finalized: boolean;
    }>();

  const handleClone = (modularTallyTemplate: {
    id: number;
    name: string;
    archived: boolean;
    finalized: boolean;
  }) => {
    setSelectedModularTallyTemplate(modularTallyTemplate);
    setOpenCreationDialog(true);
  };

  const handleArchive = (modularTallyTemplate: {
    id: number;
    name: string;
    archived: boolean;
    finalized: boolean;
  }) => {
    setSelectedModularTallyTemplate(modularTallyTemplate);
    setOpenArchiveDialog(true);
  };

  const columns: GridColDef<ModularTallyTemplateRow>[] = [
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
      valueGetter: (_, row) =>
        row.archived ? "Arquivado"
        : row.finalized ? "Finalizado"
        : "Em construção",
      renderCell: (params: GridRenderCellParams<ModularTallyTemplateRow>) => (
        <Chip
          sx={{ width: "120px" }}
          color={
            params.row.archived ? "error"
            : params.row.finalized ? "primary"
            : "info"
          }
          label={
            params.row.archived ? "Arquivado"
            : params.row.finalized ? "Finalizado"
            : "Em construção"
          }
        />
      ),
    },
    {
      field: "modularTallyCount",
      headerName: "Contagens",
      width: 110,
      align: "center",
      renderCell: (params: GridRenderCellParams<ModularTallyTemplateRow>) =>
        params.row._count.modularTally,
    },
    {
      field: "updatedAt",
      headerName: "Última edição",
      width: 180,
      renderCell: (params: GridRenderCellParams<ModularTallyTemplateRow>) =>
        dateTimeWithoutSecondsFormater.format(params.row.updatedAt),
    },
    {
      field: "actions",
      headerName: "",
      width: 80,
      sortable: false,
      filterable: false,
      hideable: false,
      renderCell: (params: GridRenderCellParams<ModularTallyTemplateRow>) => (
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
              href: `/admin/protocols/tallys/edit?modularTallyTemplateId=${params.row.id}`,
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
                      <IconTrashX /> Excluir
                    </>
                  }
                </div>
              ),
              disabled: !isConnected,
              sx: { color: "red" },
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
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-xl font-semibold">Contagens</h2>
        <PermissionGuard requiresAnyRoles={["TALLY_MANAGER"]}>
          <CButton
            square={isMobileView}
            disabled={!isConnected}
            tooltip={
              isConnected ? "" : "Conecte-se para criar um protocolo de contagem"
            }
            onClick={() => {
              setSelectedModularTallyTemplate(undefined);
              setOpenCreationDialog(true);
            }}
          >
            <IconPlus /> {isMobileView ? "" : "Criar"}
          </CButton>
        </PermissionGuard>
      </div>

      <DataGrid
        className="min-h-0 flex-1"
        loading={loading}
        rows={modularTallyTemplates}
        columns={columns}
        autoHeight={false}
      />

      <ModularTallyTemplateCreationDialog
        open={openCreationDialog}
        cloneModularTallyTemplate={selectedModularTallyTemplate}
        reloadModularTallyTemplates={() => {
          loadModularTallyTemplates({ invalidateCache: true });
        }}
        onClose={() => setOpenCreationDialog(false)}
      />
      <ModularTallyTemplateArchiveDialog
        open={openArchiveDialog}
        onClose={() => setOpenArchiveDialog(false)}
        reloadModularTallyTemplates={() => {
          loadModularTallyTemplates({ invalidateCache: true });
        }}
        modularTallyTemplate={selectedModularTallyTemplate}
      />
    </div>
  );
};

export default TallyProtocols;
