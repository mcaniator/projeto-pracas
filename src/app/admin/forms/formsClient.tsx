"use client";

import FormCreationDialog from "@/app/admin/forms/formCreationDialog";
import CAdminHeader from "@/components/ui/cAdminHeader";
import CButton from "@/components/ui/cButton";
import CTableVirtuoso, {
  CTableHeader,
  CTableRow,
} from "@/components/ui/cTableVirtuoso";
import CMenu from "@/components/ui/menu/cMenu";
import { dateTimeWithoutSecondsFormater } from "@/lib/formatters/dateFormatters";
import { useFetchForms } from "@/lib/serverFunctions/apiCalls/form";
import { FetchFormsResponse } from "@/lib/serverFunctions/queries/form";
import { Chip } from "@mui/material";
import { IconClipboard, IconPlus } from "@tabler/icons-react";
import { useCallback, useEffect, useMemo, useState } from "react";

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

  const headers: CTableHeader[] = useMemo(
    () => [
      {
        index: 0,
        content: "Nome",
        width: "50%",
        cellSx: {
          whiteSpace: "nowrap",
        },
      },
      {
        index: 1,
        content: "Status",
        width: "20%",
      },
      {
        index: 2,
        content: "Ultima edição",
        width: "30%",
        cellSx: {
          whiteSpace: "nowrap",
        },
      },
      {
        index: 3,
        width: "1px",
      },
    ],
    [],
  );

  const data: CTableRow[] = forms.map((form) => [
    {
      index: 0,
      content: form.name,
    },
    {
      index: 1,
      content: (
        <Chip
          sx={{ width: "120px" }}
          color={form.finalized ? "primary" : "error"}
          label={form.finalized ? "Finalizado" : "Em construção"}
        />
      ),
    },
    {
      index: 2,
      content: dateTimeWithoutSecondsFormater.format(new Date(form.updatedAt)),
    },
    {
      index: 3,
      content: (
        <CMenu
          options={[
            {
              label: "Ver",
              href: `/admin/forms/${form.id}/edit`,
            },
            { label: "Clonar", onClick: handleClone },
          ]}
        />
      ),
    },
  ]);
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

      <CTableVirtuoso
        loading={loading}
        fixedLastColumn
        headers={headers}
        data={data}
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
