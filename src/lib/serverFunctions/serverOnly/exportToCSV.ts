// Function to format a field for CSV
export const formatCSVField = (val?: string | null) => {
  if (val === null || val === undefined) return "";

  let str = String(val);

  // If the field contains a comma, quotation marks, or a line break, we need to escape it
  if (
    str.includes(";") ||
    str.includes('"') ||
    str.includes("\n") ||
    str.includes("\r")
  ) {
    // Duplicate the existing quotation marks and wrap the entire field in quotation marks
    str = `"${str.replace(/"/g, '""')}"`;
  }
  return str;
};
