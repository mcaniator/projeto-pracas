"use client";

import { Capacitor } from "@capacitor/core";
import { SaveAs } from "capacitor-save-as";
import { enqueueSnackbar } from "notistack";

const textToBase64 = (text: string) => {
  //toBase64() method of Uint8Array could be used, but it is not as widely supported
  const bytes = new TextEncoder().encode(text);
  let binary = "";

  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });

  return btoa(binary);
};

const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject(new Error("Failed to convert blob to base64"));
      }
    };

    reader.onerror = reject;

    reader.readAsDataURL(blob);
  });
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

export const downloadBlob = async ({
  filename,
  mimeType,
  blob,
}: {
  filename: string;
  mimeType: string;
  blob: Blob;
}) => {
  if (Capacitor.isNativePlatform()) {
    const blobBase64 = (await blobToBase64(blob)).split(",")[1];
    try {
      if (!blobBase64) {
        throw new Error("blobBase64 is undefined");
      }
      await SaveAs.showSaveAsPicker({
        filename,
        mimeType,
        data: blobBase64,
      });
      enqueueSnackbar("Arquivo salvo com sucesso!", { variant: "success" });
      return { saved: true };
    } catch (e) {
      enqueueSnackbar("Arquivo não foi salvo!", { variant: "error" });
      return { saved: false };
    }
  }

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  enqueueSnackbar("Arquivo salvo com sucesso!", { variant: "success" });
  return { saved: true };
};
