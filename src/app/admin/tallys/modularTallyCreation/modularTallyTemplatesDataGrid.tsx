import { dateTimeWithoutSecondsFormater } from "@/lib/formatters/dateFormatters";
import { useFetchModularTallyTemplates } from "@/lib/serverFunctions/apiCalls/modularTally";
import type { FetchModularTallyTemplatesResponse } from "@/lib/serverFunctions/queries/modularTally";
import { Radio } from "@mui/material";
import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { useCallback, useEffect, useState } from "react";

type ModularTallyTemplateRow =
  FetchModularTallyTemplatesResponse["modularTallyTemplates"][number];

const ModularTallyTemplatesDataGrid = ({
  selectedModularTallyTemplate,
  onSelectModularTallyTemplate,
}: {
  selectedModularTallyTemplate: { id: number } | null;
  onSelectModularTallyTemplate: (id: number) => void;
}) => {
  const [modularTallyTemplates, setModularTallyTemplates] = useState<
    FetchModularTallyTemplatesResponse["modularTallyTemplates"]
  >([]);
  const [fetchModularTallyTemplates, isLoading] = useFetchModularTallyTemplates(
    {
      callbacks: {
        onSuccess: ({ data }) => {
          setModularTallyTemplates(data?.modularTallyTemplates ?? []);
        },
      },
    },
  );

  const loadModularTallyTemplates = useCallback(() => {
    void fetchModularTallyTemplates({ params: { finalizedOnly: true } });
  }, [fetchModularTallyTemplates]);

  useEffect(() => {
    loadModularTallyTemplates();
  }, [loadModularTallyTemplates]);

  const columns: GridColDef<ModularTallyTemplateRow>[] = [
    {
      field: "action",
      headerName: "",
      sortable: false,
      hideable: false,
      filterable: false,
      renderCell: (params: GridRenderCellParams<ModularTallyTemplateRow>) => (
        <Radio
          checked={params.row.id === selectedModularTallyTemplate?.id}
          onClick={() => onSelectModularTallyTemplate(params.row.id)}
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
      renderCell: (params: GridRenderCellParams<ModularTallyTemplateRow>) =>
        dateTimeWithoutSecondsFormater.format(params.row.updatedAt),
    },
  ];

  return (
    <div style={{ height: "50vh" }}>
      <DataGrid
        loading={isLoading}
        rows={modularTallyTemplates}
        columns={columns}
        autoHeight={false}
        rowSelection={false}
      />
    </div>
  );
};

export default ModularTallyTemplatesDataGrid;
