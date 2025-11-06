"use client";

import {
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";

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

  return (
    <TableContainer>
      <Table>
        <TableHead sx={{ backgroundColor: "primary.lighter3" }}>
          <TableRow>
            <TableCell sx={{ width: "50%" }}>Nome</TableCell>
            <TableCell align="right" sx={{ width: "20%" }}>
              Status
            </TableCell>
            <TableCell align="right" sx={{ width: "20%" }}>
              Ultima edição
            </TableCell>
            <TableCell sx={{ width: "20%" }}></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {forms.map((form, index) => (
            <TableRow key={index}>
              <TableCell sx={{ width: "50%" }}>{form.name}</TableCell>
              <TableCell align="right" sx={{ width: "20%" }}>
                <Chip
                  sx={{ width: "120px" }}
                  color={form.finalized ? "primary" : "error"}
                  label={form.finalized ? "Finalizado" : "Em construção"}
                />
              </TableCell>
              <TableCell align="right" sx={{ width: "20%" }}>
                {dateTimeWithoutSecondsFormater.format(form.updatedAt)}
              </TableCell>
              <TableCell align="right" sx={{ width: "20%" }}>
                <CMenu
                  options={[
                    {
                      label: "Ver",
                      href: `/admin/forms/${form.id}/edit`,
                    },
                    { label: "Clonar", onClick: handleClone },
                  ]}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default FormsTable;
