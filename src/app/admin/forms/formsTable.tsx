"use client";

import {
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import { IconDotsVertical } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { dateTimeFormatter } from "../../../lib/formatters/dateFormatters";

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
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedFormId, setSelectedFormId] = useState<number | null>(null);
  const router = useRouter();

  const handleOpenMenu = (
    event: React.MouseEvent<HTMLElement>,
    formId: number,
  ) => {
    setAnchorEl(event.currentTarget);
    setSelectedFormId(formId);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
    setSelectedFormId(null);
  };

  const handleView = () => {
    if (selectedFormId) router.push(`/admin/forms/${selectedFormId}/edit`);
    handleCloseMenu();
  };

  const handleClone = () => {
    console.log("Clone form", selectedFormId);
    handleCloseMenu();
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
                {dateTimeFormatter.format(form.updatedAt)}
              </TableCell>
              <TableCell align="right" sx={{ width: "20%" }}>
                {
                  <IconButton onClick={(e) => handleOpenMenu(e, form.id)}>
                    <IconDotsVertical />
                  </IconButton>
                }
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
      >
        <MenuItem onClick={handleView}>Ver</MenuItem>
        <MenuItem onClick={handleClone}>Clonar</MenuItem>
      </Menu>
    </TableContainer>
  );
};

export default FormsTable;
