import { dateTimeWithoutSecondsFormater } from "@/lib/formatters/dateFormatters";
import { useFetchForms } from "@/lib/serverFunctions/apiCalls/form";
import { FetchFormsResponse } from "@/lib/serverFunctions/queries/form";
import { Radio } from "@mui/material";
import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { useCallback, useEffect, useState } from "react";

type FormRow = FetchFormsResponse["forms"][number];
const FormsDataGrid = ({
  selectedForm,
  handleSelectForm,
}: {
  selectedForm: { id: number } | null;
  handleSelectForm: (id: number) => void;
}) => {
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
    void _fetchForms({ finalizedOnly: true });
  }, [_fetchForms]);
  useEffect(() => {
    void loadForms();
  }, [loadForms]);
  const [forms, setForms] = useState<FetchFormsResponse["forms"]>([]);
  const columns: GridColDef<FormRow>[] = [
    {
      field: "Ação",
      headerName: "",
      sortable: false,
      hideable: false,
      filterable: false,
      renderCell: (params: GridRenderCellParams<FormRow>) => (
        <Radio
          checked={params.row.id === selectedForm?.id}
          onClick={() => handleSelectForm(params.row.id)}
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
      renderCell: (params: GridRenderCellParams<FormRow>) =>
        dateTimeWithoutSecondsFormater.format(new Date(params.row.updatedAt)),
    },
  ];
  return (
    <div style={{ height: "50vh" }}>
      <DataGrid
        loading={loading}
        rows={forms}
        columns={columns}
        autoHeight={false}
        rowSelection={false}
      />
    </div>
  );
};

export default FormsDataGrid;
