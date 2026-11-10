import { dateTimeWithoutSecondsFormater } from "@/lib/formatters/dateFormatters";
import { useFetchBehavioralMapProtocols } from "@/lib/serverFunctions/apiCalls/behavioralMapProtocol";
import type { FetchBehavioralMapProtocolsResponse } from "@/lib/serverFunctions/queries/behavioralMapProtocol";
import { Radio } from "@mui/material";
import {
  DataGrid,
  type GridColDef,
  type GridRenderCellParams,
} from "@mui/x-data-grid";
import { useCallback, useEffect, useState } from "react";

type Protocol =
  FetchBehavioralMapProtocolsResponse["behavioralMapProtocols"][number];
export default function BehavioralMapProtocolsDataGrid({
  selectedId,
  onSelect,
}: {
  selectedId: number | null;
  onSelect: (id: number) => void;
}) {
  const [rows, setRows] = useState<Protocol[]>([]);
  const [fetchProtocols, loading] = useFetchBehavioralMapProtocols({
    callbacks: {
      onSuccess: ({ data }) => setRows(data?.behavioralMapProtocols ?? []),
    },
  });
  const load = useCallback(() => {
    void fetchProtocols({ params: { finalizedOnly: true } });
  }, [fetchProtocols]);
  useEffect(() => {
    load();
  }, [load]);
  const columns: GridColDef<Protocol>[] = [
    {
      field: "action",
      headerName: "",
      width: 55,
      sortable: false,
      filterable: false,
      renderCell: (params: GridRenderCellParams<Protocol>) => (
        <Radio
          checked={params.row.id === selectedId}
          onClick={() => onSelect(params.row.id)}
        />
      ),
    },
    { field: "name", headerName: "Nome", flex: 1, minWidth: 150 },
    {
      field: "updatedAt",
      headerName: "Última edição",
      width: 180,
      renderCell: (params: GridRenderCellParams<Protocol>) =>
        dateTimeWithoutSecondsFormater.format(params.row.updatedAt),
    },
  ];
  return (
    <div style={{ height: "50vh" }}>
      <DataGrid
        loading={loading}
        rows={rows}
        columns={columns}
        autoHeight={false}
        rowSelection={false}
      />
    </div>
  );
}
