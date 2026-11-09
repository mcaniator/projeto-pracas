"use client";

import BehavioralMapProtocolArchiveDialog from "@/app/admin/protocols/behavioralMaps/behavioralMapProtocolArchiveDialog";
import BehavioralMapProtocolCreationDialog from "@/app/admin/protocols/behavioralMaps/behavioralMapProtocolCreationDialog";
import PermissionGuard from "@/components/auth/permissionGuard";
import { useNetwork } from "@/components/context/networkContext";
import CButton from "@/components/ui/cButton";
import CMenu from "@/components/ui/menu/cMenu";
import { dateTimeWithoutSecondsFormater } from "@/lib/formatters/dateFormatters";
import { useFetchBehavioralMapProtocols } from "@/lib/serverFunctions/apiCalls/behavioralMapProtocol";
import type { FetchBehavioralMapProtocolsResponse } from "@/lib/serverFunctions/queries/behavioralMapProtocol";
import { Chip, useMediaQuery, useTheme } from "@mui/material";
import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { IconCopy, IconEye, IconPencil, IconPlus, IconTrashX } from "@tabler/icons-react";
import { useCallback, useEffect, useState } from "react";
import { FaTrashRestore } from "react-icons/fa";

type ProtocolRow = FetchBehavioralMapProtocolsResponse["behavioralMapProtocols"][number];
type ProtocolReference = Pick<ProtocolRow, "id" | "name" | "archived" | "finalized">;

const BehavioralMapProtocols = () => {
  const theme = useTheme();
  const { isConnected } = useNetwork();
  const isMobileView = useMediaQuery(theme.breakpoints.down("lg"));
  const [protocols, setProtocols] = useState<FetchBehavioralMapProtocolsResponse["behavioralMapProtocols"]>([]);
  const [openCreationDialog, setOpenCreationDialog] = useState(false);
  const [openArchiveDialog, setOpenArchiveDialog] = useState(false);
  const [selectedProtocol, setSelectedProtocol] = useState<ProtocolReference>();

  const [fetchProtocols, loading] = useFetchBehavioralMapProtocols({
    callbacks: { onSuccess: ({ data }) => data && setProtocols(data.behavioralMapProtocols) },
  });

  const loadProtocols = useCallback(
    ({ invalidateCache }: { invalidateCache?: boolean } = {}) => {
      void fetchProtocols({
        params: { includeArchived: true },
        requestOptions: { cache: invalidateCache ? "reload" : "default" },
      });
    },
    [fetchProtocols],
  );

  useEffect(() => {
    loadProtocols();
  }, [loadProtocols]);

  const openCloneDialog = (protocol: ProtocolReference) => {
    setSelectedProtocol(protocol);
    setOpenCreationDialog(true);
  };
  const openStatusDialog = (protocol: ProtocolReference) => {
    setSelectedProtocol(protocol);
    setOpenArchiveDialog(true);
  };

  const columns: GridColDef<ProtocolRow>[] = [
    {
      field: "actions",
      headerName: "",
      width: 80,
      sortable: false,
      filterable: false,
      hideable: false,
      renderCell: (params: GridRenderCellParams<ProtocolRow>) => (
        <CMenu
          options={[
            {
              label: params.row.finalized ? <div className="flex items-center"><IconEye />Ver</div> : <div className="flex items-center"><IconPencil />Editar</div>,
              href: `/admin/protocols/behavioralMaps/edit?behavioralMapProtocolId=${params.row.id}`,
            },
            {
              label: <div className="flex items-center"><IconCopy />Clonar</div>,
              disabled: !isConnected,
              onClick: () => openCloneDialog(params.row),
            },
            {
              label: <div className="flex items-center">{params.row.archived ? <><FaTrashRestore /> Restaurar</> : <><IconTrashX /> Excluir</>}</div>,
              disabled: !isConnected,
              sx: { color: "red" },
              onClick: () => openStatusDialog(params.row),
            },
          ]}
        />
      ),
    },
    { field: "name", headerName: "Nome", flex: 1, minWidth: 150 },
    {
      field: "status",
      headerName: "Status",
      width: 150,
      valueGetter: (_, row) => row.archived ? "Arquivado" : row.finalized ? "Finalizado" : "Em construção",
      renderCell: (params: GridRenderCellParams<ProtocolRow>) => (
        <Chip
          sx={{ width: "120px" }}
          color={params.row.archived ? "error" : params.row.finalized ? "primary" : "info"}
          label={params.row.archived ? "Arquivado" : params.row.finalized ? "Finalizado" : "Em construção"}
        />
      ),
    },
    {
      field: "behavioralMapCount",
      headerName: "Usos",
      width: 110,
      align: "center",
      renderCell: (params: GridRenderCellParams<ProtocolRow>) => params.row._count.behavioralMaps,
    },
    {
      field: "updatedAt",
      headerName: "Última edição",
      width: 180,
      renderCell: (params: GridRenderCellParams<ProtocolRow>) => dateTimeWithoutSecondsFormater.format(params.row.updatedAt),
    },
  ];

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-xl font-semibold">Mapas comportamentais</h2>
        <PermissionGuard requiresAnyRoles={["TALLY_MANAGER"]}>
          <CButton
            square={isMobileView}
            disabled={!isConnected}
            tooltip={isConnected ? "" : "Conecte-se para criar um protocolo de mapa comportamental"}
            onClick={() => {
              setSelectedProtocol(undefined);
              setOpenCreationDialog(true);
            }}
          >
            <IconPlus /> {isMobileView ? "" : "Criar"}
          </CButton>
        </PermissionGuard>
      </div>

      <DataGrid className="min-h-0 flex-1" loading={loading} rows={protocols} columns={columns} autoHeight={false} />

      <BehavioralMapProtocolCreationDialog
        open={openCreationDialog}
        cloneProtocol={selectedProtocol}
        reloadProtocols={() => loadProtocols({ invalidateCache: true })}
        onClose={() => setOpenCreationDialog(false)}
      />
      <BehavioralMapProtocolArchiveDialog
        open={openArchiveDialog}
        onClose={() => setOpenArchiveDialog(false)}
        reloadProtocols={() => loadProtocols({ invalidateCache: true })}
        protocol={selectedProtocol}
      />
    </div>
  );
};

export default BehavioralMapProtocols;
