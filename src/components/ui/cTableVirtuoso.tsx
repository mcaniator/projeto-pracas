import { SxProps, Theme } from "@mui/material";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import { ReactNode, forwardRef, useMemo } from "react";
import { TableVirtuoso, TableVirtuosoProps } from "react-virtuoso";

export type CTableHeader = {
  index: number;
  content: ReactNode;
  width?: number | string;
  headerSx?: SxProps<Theme>;
  cellSx?: SxProps<Theme>;
};

export type CTableCell = {
  index: number;
  content: ReactNode;
};

export type CTableRow = CTableCell[];

export type CTableVirtuosoProps = {
  headers: CTableHeader[];
  data: CTableRow[];
  fixedLastColumn?: boolean;
};

const TableComponents: TableVirtuosoProps<CTableRow, unknown>["components"] = {
  Scroller: forwardRef((props, ref) => (
    <TableContainer component={Paper} {...props} ref={ref} />
  )),
  Table: (props) => <Table {...props} style={{ borderCollapse: "separate" }} />,
  TableBody: forwardRef((props, ref) => <TableBody {...props} ref={ref} />),
  TableHead: TableHead,
  TableRow: TableRow,
};
if (TableComponents.Scroller) {
  TableComponents.Scroller.displayName = "TableVirtuosoScroller";
}
if (TableComponents.TableBody) {
  TableComponents.TableBody.displayName = "TableVirtuosoBody";
}

const CTableVirtuoso = ({
  headers,
  data,
  fixedLastColumn,
}: CTableVirtuosoProps) => {
  const sortedHeaders = useMemo(
    () => [...headers].sort((a, b) => a.index - b.index),
    [headers],
  );

  const lastIndex = useMemo(() => sortedHeaders.length - 1, [sortedHeaders]);

  return (
    <TableVirtuoso
      components={TableComponents}
      data={data}
      fixedHeaderContent={() => (
        <TableRow>
          {sortedHeaders.map((header, i) => (
            <TableCell
              key={header.index}
              sx={{
                backgroundColor: "primary.lighter3",
                width: header.width,
                whiteSpace: "nowrap",
                ...header.headerSx,
                ...(fixedLastColumn && i === lastIndex ?
                  {
                    position: "sticky",
                    right: 0,
                    zIndex: 2,
                    boxShadow: "-4px 0px 4px -2px rgba(0, 0, 0, 0.2)",
                  }
                : {}),
              }}
            >
              {header.content}
            </TableCell>
          ))}
        </TableRow>
      )}
      itemContent={(_index, row) => (
        <>
          {sortedHeaders.map((header, i) => {
            const cell = row[header.index];
            return (
              <TableCell
                key={header.index}
                sx={{
                  width: header.width,
                  whiteSpace: "nowrap",
                  ...header.cellSx,
                  ...(fixedLastColumn && i === lastIndex ?
                    {
                      position: "sticky",
                      right: 0,
                      zIndex: 1,
                      backgroundColor: "background.paper",
                      boxShadow: "-4px 0px 4px -2px rgba(0, 0, 0, 0.2)",
                      px: "0px",
                    }
                  : {}),
                }}
              >
                {cell?.content}
              </TableCell>
            );
          })}
        </>
      )}
      style={{ height: "100%" }}
    />
  );
};

export default CTableVirtuoso;
