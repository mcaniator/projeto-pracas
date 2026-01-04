"use client";

import CTableVirtuoso, {
  CTableHeader,
  CTableRow,
} from "@/components/ui/cTableVirtuoso";
import { Chip } from "@mui/material";
import { useMemo } from "react";

import CMenu from "../../../components/ui/menu/cMenu";
import { dateTimeWithoutSecondsFormater } from "../../../lib/formatters/dateFormatters";

const FormsTable = ({
  forms,
}: {
  forms: {
    name: string;
    finalized: boolean;
    updatedAt: Date;
    id: number;
  }[];
}) => {
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
      content: dateTimeWithoutSecondsFormater.format(form.updatedAt),
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
    <div style={{ height: "calc(100vh - 200px)" }}>
      <CTableVirtuoso fixedLastColumn headers={headers} data={data} />
    </div>
  );
};

export default FormsTable;
