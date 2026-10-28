import type ExcelJS from "exceljs";

export const getWorksheetName = (name: string) => {
  return (
    name
      .split("")
      .map((character) => ("\\/*?:[]".includes(character) ? " " : character))
      .join("")
      .trim()
      .slice(0, 31) || "Planilha"
  );
};

/**
 * Autofit columns by width
 *
 * @param worksheet {ExcelJS.Worksheet}
 * @param minimalWidth
 */
export const autoWidthWorksheetColumns = (
  worksheet: ExcelJS.Worksheet,
  minimalWidth = 10,
) => {
  worksheet.columns.forEach((column) => {
    if (!column) return;

    let maxColumnLength = 0;
    column.eachCell?.({ includeEmpty: true }, (cell) => {
      maxColumnLength = Math.max(
        maxColumnLength,
        minimalWidth,
        typeof cell.value === "string" ? cell.value.length : 0,
      );
    });
    column.width = maxColumnLength + 2;
  });
};
