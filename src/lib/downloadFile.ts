"use client";

import { Capacitor } from "@capacitor/core";
import { Directory, Encoding, Filesystem } from "@capacitor/filesystem";

export const downloadCSVFileFromText = async ({
  filename,
  content,
}: {
  filename: string;
  content: string;
}) => {
  if (Capacitor.isNativePlatform()) {
    await Filesystem.writeFile({
      path: filename,
      data: content,
      directory: Directory.Documents,
      encoding: Encoding.UTF8,
    });

    return { saved: true, path: filename };
  }

  const blob = new Blob([content], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  return { saved: true };
};
