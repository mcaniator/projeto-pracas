"use client";

import TallyProtocolArchiveDialog from "@/app/admin/protocols/tallys/tallyProtocolArchiveDialog";
import TallyProtocolCreationDialog from "@/app/admin/protocols/tallys/tallyProtocolCreationDialog";
import PermissionGuard from "@/components/auth/permissionGuard";
import { useNetwork } from "@/components/context/networkContext";
import CButton from "@/components/ui/cButton";
import CMenu from "@/components/ui/menu/cMenu";
import { dateTimeWithoutSecondsFormater } from "@/lib/formatters/dateFormatters";
import { useFetchTallyProtocols } from "@/lib/serverFunctions/apiCalls/tally";
import { FetchTallyProtocolsResponse } from "@/lib/serverFunctions/queries/tally";
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

type TallyProtocolRow =
  FetchTallyProtocolsResponse["tallyProtocols"][number];

const TallyProtocols = () => {
  const theme = useTheme();
  const { isConnected } = useNetwork();
  const isMobileView = useMediaQuery(theme.breakpoints.down("lg"));
  const [_fetchTallyProtocols, loading] =
    useFetchTallyProtocols({
      callbacks: {
        onSuccess: ({ data }) => {
          if (data) {
            setTallyProtocols(data.tallyProtocols);
          }
        },
      },
    });

  const loadTallyProtocols = useCallback(
    ({ invalidateCache }: { invalidateCache?: boolean } = {}) => {
      void _fetchTallyProtocols({
        params: { includeArchived: true },
        requestOptions: {
          cache: invalidateCache ? "reload" : "default",
        },
      });
    },
    [_fetchTallyProtocols],
  );

  useEffect(() => {
    void loadTallyProtocols();
  }, [loadTallyProtocols]);

  const [tallyProtocols, setTallyProtocols] = useState<
    FetchTallyProtocolsResponse["tallyProtocols"]
  >([]);
  const [openCreationDialog, setOpenCreationDialog] = useState(false);
  const [openArchiveDialog, setOpenArchiveDialog] = useState(false);
  const [selectedTallyProtocol, setSelectedTallyProtocol] =
    useState<{
      id: number;
      name: string;
      archived: boolean;
      finalized: boolean;
    }>();

  const handleClone = (tallyProtocol: {
    id: number;
    name: string;
    archived: boolean;
    finalized: boolean;
  }) => {
    setSelectedTallyProtocol(tallyProtocol);
    setOpenCreationDialog(true);
  };

  const handleArchive = (tallyProtocol: {
    id: number;
    name: string;
    archived: boolean;
    finalized: boolean;
  }) => {
    setSelectedTallyProtocol(tallyProtocol);
    setOpenArchiveDialog(true);
  };

  const columns: GridColDef<TallyProtocolRow>[] = [
    {
      field: "actions",
      headerName: "",
      width: 80,
      sortable: false,
      filterable: false,
      hideable: false,
      renderCell: (params: GridRenderCellParams<TallyProtocolRow>) => (
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
              href: `/admin/protocols/tallys/edit?tallyProtocolId=${params.row.id}`,
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
      renderCell: (params: GridRenderCellParams<TallyProtocolRow>) => (
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
      field: "tallyCount",
      headerName: "Usos",
      width: 110,
      align: "center",
      renderCell: (params: GridRenderCellParams<TallyProtocolRow>) =>
        params.row._count.tally,
    },
    {
      field: "updatedAt",
      headerName: "Última edição",
      width: 180,
      renderCell: (params: GridRenderCellParams<TallyProtocolRow>) =>
        dateTimeWithoutSecondsFormater.format(params.row.updatedAt),
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
              setSelectedTallyProtocol(undefined);
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
        rows={tallyProtocols}
        columns={columns}
        autoHeight={false}
      />

      <TallyProtocolCreationDialog
        open={openCreationDialog}
        cloneTallyProtocol={selectedTallyProtocol}
        reloadTallyProtocols={() => {
          loadTallyProtocols({ invalidateCache: true });
        }}
        onClose={() => setOpenCreationDialog(false)}
      />
      <TallyProtocolArchiveDialog
        open={openArchiveDialog}
        onClose={() => setOpenArchiveDialog(false)}
        reloadTallyProtocols={() => {
          loadTallyProtocols({ invalidateCache: true });
        }}
        tallyProtocol={selectedTallyProtocol}
      />
    </div>
  );
};

export default TallyProtocols;
