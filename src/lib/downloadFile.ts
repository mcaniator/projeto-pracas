"use client";

import { Capacitor } from "@capacitor/core";
import { SaveAs } from "capacitor-save-as";

const textToBase64 = (text: string) => {
  //toBase64() method of Uint8Array could be used, but it is not as widely supported
  const bytes = new TextEncoder().encode(text);
  let binary = "";

  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });

  return btoa(binary);
};

export const downloadCSVFileFromText = async ({
  filename,
  content,
}: {
  filename: string;
  content: string;
}) => {
  if (Capacitor.isNativePlatform()) {
    await SaveAs.showSaveAsPicker({
      filename,
      mimeType: "text/csv",
      data: textToBase64(content),
    });

    return { saved: true };
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
