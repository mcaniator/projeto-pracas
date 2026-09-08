export const formatFileSize = (bytes: number | undefined) => {
  if (bytes == null || bytes < 0) return "0 KB";

  const formatValue = (value: number) => Number(value.toFixed(2)).toString();
  const kb = bytes / 1024;

  if (kb < 1024) {
    return `${formatValue(kb)} KB`;
  }

  const mb = kb / 1024;
  if (mb < 1024) {
    return `${formatValue(mb)} MB`;
  }

  const gb = mb / 1024;
  return `${formatValue(gb)} GB`;
};
