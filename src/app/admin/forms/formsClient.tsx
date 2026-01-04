"use client";

import FormCreationDialog from "@/app/admin/forms/formCreationDialog";
import CAdminHeader from "@/components/ui/cAdminHeader";
import CButton from "@/components/ui/cButton";
import CMenu from "@/components/ui/menu/cMenu";
import { dateTimeWithoutSecondsFormater } from "@/lib/formatters/dateFormatters";
import { useFetchForms } from "@/lib/serverFunctions/apiCalls/form";
import { FetchFormsResponse } from "@/lib/serverFunctions/queries/form";
import { Chip } from "@mui/material";
import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { IconClipboard, IconPlus } from "@tabler/icons-react";
import { useCallback, useEffect, useState } from "react";

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
    void _fetchForms({});
  }, [_fetchForms]);

  useEffect(() => {
    void loadForms();
  }, [loadForms]);

  const [forms, setForms] = useState<FetchFormsResponse["forms"]>([]);
  const [openFormCreationDialog, setOpenFormCreationDialog] = useState(false);

  const handleClone = () => {
    console.log("Clone form");
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
      valueGetter: (value, row) => (row.finalized ? 1 : 0),
      renderCell: (params: GridRenderCellParams<FormRow>) => (
        <Chip
          sx={{ width: "120px" }}
          color={params.row.finalized ? "primary" : "error"}
          label={params.row.finalized ? "Finalizado" : "Em construção"}
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
      renderCell: (params: GridRenderCellParams<FormRow>) => (
        <CMenu
          options={[
            { label: "Ver", href: `/admin/forms/${params.row.id}/edit` },
            { label: "Clonar", onClick: () => handleClone() },
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
          <CButton onClick={() => setOpenFormCreationDialog(true)}>
            <IconPlus /> Criar
          </CButton>
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
        reloadForms={loadForms}
        onClose={() => setOpenFormCreationDialog(false)}
      />
    </div>
  );
};

export default FormsClient;
