import { dateTimeWithoutSecondsFormater } from "@/lib/formatters/dateFormatters";
import { useFetchTallyProtocols } from "@/lib/serverFunctions/apiCalls/tally";
import type { FetchTallyProtocolsResponse } from "@/lib/serverFunctions/queries/tally";
import { Radio } from "@mui/material";
import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { useCallback, useEffect, useState } from "react";

type TallyProtocolRow =
  FetchTallyProtocolsResponse["tallyProtocols"][number];

const TallyProtocolsDataGrid = ({
  selectedTallyProtocol,
  onSelectTallyProtocol,
}: {
  selectedTallyProtocol: { id: number } | null;
  onSelectTallyProtocol: (id: number) => void;
}) => {
  const [tallyProtocols, setTallyProtocols] = useState<
    FetchTallyProtocolsResponse["tallyProtocols"]
  >([]);
  const [fetchTallyProtocols, isLoading] = useFetchTallyProtocols(
    {
      callbacks: {
        onSuccess: ({ data }) => {
          setTallyProtocols(data?.tallyProtocols ?? []);
        },
      },
    },
  );

  const loadTallyProtocols = useCallback(() => {
    void fetchTallyProtocols({ params: { finalizedOnly: true } });
  }, [fetchTallyProtocols]);

  useEffect(() => {
    loadTallyProtocols();
  }, [loadTallyProtocols]);

  const columns: GridColDef<TallyProtocolRow>[] = [
    {
      field: "action",
      headerName: "",
      sortable: false,
      hideable: false,
      filterable: false,
      renderCell: (params: GridRenderCellParams<TallyProtocolRow>) => (
        <Radio
          checked={params.row.id === selectedTallyProtocol?.id}
          onClick={() => onSelectTallyProtocol(params.row.id)}
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
      field: "updatedAt",
      headerName: "Última edição",
      width: 180,
      renderCell: (params: GridRenderCellParams<TallyProtocolRow>) =>
        dateTimeWithoutSecondsFormater.format(params.row.updatedAt),
    },
  ];

  return (
    <div style={{ height: "50vh" }}>
      <DataGrid
        loading={isLoading}
        rows={tallyProtocols}
        columns={columns}
        autoHeight={false}
        rowSelection={false}
      />
    </div>
  );
};

export default TallyProtocolsDataGrid;
