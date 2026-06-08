import { UploadImageResponseParams } from "@/app/api/admin/uploadImageResponse/route";
import type { APIResponseInfo } from "@/lib/types/backendCalls/APIResponse";
import {
  buildGoogleDriveDirectImageUrl,
  buildGoogleDriveThumbnailImageUrl,
} from "@/lib/utils/image";
import { Readable } from "stream";

export type UploadImageResponseData = {
  fileUid: string;
  relativePath: string;
  size: number | null;
  name: string;
  mimeType: string;
  webViewLink: string | null;
  webContentLink: string | null;
  directUrl: string | null;
  thumbnailUrl: string | null;
};

export const uploadImageResponse = async ({
  folderId,
  image,
}: UploadImageResponseParams): Promise<{
  responseInfo: APIResponseInfo;
  data?: UploadImageResponseData | null;
}> => {
  try {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;

    if (!clientId || !clientSecret || !refreshToken) {
      return {
        responseInfo: {
          statusCode: 500,
          message: "Credenciais OAuth do Google Drive nao configuradas!",
        },
        data: null,
      };
    }

    const { google } = await import("googleapis");
    const auth = new google.auth.OAuth2(clientId, clientSecret);
    auth.setCredentials({
      refresh_token: refreshToken,
    });

    const drive = google.drive({ version: "v3", auth });
    const imageBuffer = Buffer.from(await image.arrayBuffer());
    const uploadResponse = await drive.files.create({
      requestBody: {
        name: image.name,
        mimeType: image.type,
        parents: [folderId],
      },
      media: {
        mimeType: image.type,
        body: Readable.from(imageBuffer),
      },
      fields: "id,name,mimeType,size,webViewLink,webContentLink",
      supportsAllDrives: true,
    });

    const uploadedResponseData = uploadResponse.data;

    if (!uploadedResponseData.id) {
      return {
        responseInfo: {
          statusCode: 500,
          message: "Upload concluido sem identificador do arquivo!",
        },
        data: null,
      };
    }

    const size =
      uploadedResponseData.size ?
        Number(uploadedResponseData.size)
      : image.size;

    return {
      responseInfo: {
        statusCode: 201,
        message: "Imagem enviada ao Google Drive!",
        showSuccessCard: true,
      },
      data: {
        fileUid: uploadedResponseData.id,
        relativePath: uploadedResponseData.id,
        size: Number.isFinite(size) ? size : null,
        name: uploadedResponseData.name ?? image.name,
        mimeType: uploadedResponseData.mimeType ?? image.type,
        webViewLink: uploadedResponseData.webViewLink ?? null,
        webContentLink: uploadedResponseData.webContentLink ?? null,
        directUrl: buildGoogleDriveDirectImageUrl({
          uid: uploadedResponseData.id,
        }),
        thumbnailUrl: buildGoogleDriveThumbnailImageUrl({
          uid: uploadedResponseData.id,
        }),
      },
    };
  } catch (error) {
    const googleError = error as {
      code?: number;
      status?: number;
      message?: string;
    };
    const statusCode =
      typeof googleError.code === "number" ? googleError.code
      : typeof googleError.status === "number" ? googleError.status
      : 500;

    return {
      responseInfo: {
        statusCode,
        message:
          googleError.message ?? "Erro ao enviar imagem ao Google Drive!",
      },
      data: null,
    };
  }
};
