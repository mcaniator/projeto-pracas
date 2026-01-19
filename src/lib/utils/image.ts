import { prisma } from "@/lib/prisma";
import { Image } from "@prisma/client";
import { z } from "zod";

const uploadResponseSchema = z.object({
  fileId: z.string(),
  name: z.string(),
  size: z.number(),
  versionInfo: z.object({
    id: z.string(),
    name: z.string(),
  }),
  filePath: z.string(),
  url: z.string(),
  fileType: z.string(),
  height: z.number(),
  width: z.number(),
  thumbnailUrl: z.string(),
});

export const uploadImage: (file: File) => Promise<Image> = async (
  file: File,
) => {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // Cria novo FormData para o ImageKit
  const imageKitForm = new FormData();
  imageKitForm.append(
    "file",
    new Blob([buffer], { type: file.type }),
    file.name,
  );
  imageKitForm.append("fileName", file.name);

  const auth = Buffer.from(`${process.env.IMAGE_CDN_PRIVATE_KEY}:`).toString(
    "base64",
  );

  const response = await fetch(process.env.IMAGE_UPLOAD_ENDPOINT!, {
    method: "POST",
    headers: {
      Accept: "application/json",
      Authorization: `Basic ${auth}`,
    },
    body: imageKitForm,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error);
  }

  const json = (await response.json()) as unknown;
  const parsedJson = uploadResponseSchema.parse(json);

  const image = await prisma.image.create({
    data: {
      fileUid: parsedJson.fileId,
      relativePath: parsedJson.filePath,
      size: parsedJson.size,
    },
  });

  return image;
};

export const deleteImage = async (fileUid: string) => {
  const auth = Buffer.from(`${process.env.IMAGE_CDN_PRIVATE_KEY}:`).toString(
    "base64",
  );
  await prisma.$transaction(async (tx) => {
    await tx.$executeRaw`DELETE FROM image WHERE file_uid = ${fileUid}`;
    const response = await fetch(
      `${process.env.IMAGE_DELETE_ENDPOINT}/${fileUid}`,
      {
        method: "DELETE",
        headers: {
          Accept: "application/json",
          Authorization: `Basic ${auth}`,
        },
      },
    );
    if (!response.ok) {
      const error = await response.text();
      throw new Error(error);
    }
  });
};

export const buildImageUrl = (path: string | null) => {
  if (!process.env.IMAGE_CDN_IMAGE_BASE_URL || !path) {
    return null;
  }
  return `${process.env.IMAGE_CDN_IMAGE_BASE_URL}/${path}`;
};

export async function getImageFromUrl(url: string, fileName?: string) {
  const response = await fetch(url);
  const blob = await response.blob();

  return new File([blob], fileName ?? "image", {
    type: blob.type,
  });
}
