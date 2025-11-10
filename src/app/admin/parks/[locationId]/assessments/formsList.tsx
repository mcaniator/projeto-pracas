import {
  Radio,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";
import { use } from "react";

import CCheckbox from "../../../../../components/ui/cCheckbox";
import { dateTimeFormatter } from "../../../../../lib/formatters/dateFormatters";

const FormsList = ({
  formsPromise,
}: {
  formsPromise: Promise<{
    statusCode: number;
    forms: {
      id: number;
      updatedAt: Date;
      name: string;
      finalized: boolean;
    }[];
  }>;
}) => {
  const forms = use(formsPromise).forms;
  return (
    <Table>
      <TableHead sx={{ backgroundColor: "primary.lighter3" }}>
        <TableRow>
          <TableCell sx={{ width: "10%" }}></TableCell>
          <TableCell sx={{ width: "70%" }}>Nome</TableCell>
          <TableCell align="right" sx={{ width: "20%" }}>
            Ultima edição
          </TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {forms.map((f, index) => (
          <TableRow key={index}>
            <TableCell sx={{ width: "10%" }}>
              <Radio />
            </TableCell>
            <TableCell sx={{ width: "70%" }}>{`${f.name}`}</TableCell>
            <TableCell
              align="right"
              sx={{ width: "20%" }}
            >{`${dateTimeFormatter.format(f.updatedAt)}`}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default FormsList;
