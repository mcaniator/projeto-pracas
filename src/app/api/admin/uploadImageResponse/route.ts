import { uploadImageResponse } from "@/lib/serverFunctions/storage/drive/assessment";
import { checkIfLoggedInUserHasAnyPermission } from "@serverOnly/checkPermission";
import { NextRequest } from "next/server";
import { z } from "zod";

const paramsSchema = z.object({
  folderId: z.string().trim().min(1),
  image: z
    .custom<File>((value) => value instanceof File)
    .refine((file) => file.type.startsWith("image/"), {
      message: "Arquivo invalido!",
    }),
});

export type UploadImageResponseParams = z.infer<typeof paramsSchema>;

export async function POST(request: NextRequest) {
  try {
    try {
      await checkIfLoggedInUserHasAnyPermission({ roleGroups: ["ASSESSMENT"] });
    } catch (e) {
      return new Response("Unauthorized", { status: 401 });
    }

    const formData = await request.formData();
    const params = paramsSchema.safeParse({
      folderId: formData.get("folderId"),
      image: formData.get("image"),
    });

    if (!params.success) {
      return new Response(
        JSON.stringify({
          responseInfo: {
            statusCode: 400,
            message: "Dados invalidos para envio da imagem!",
          },
          data: null,
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
    }

    const uploadResponse = await uploadImageResponse(params.data);

    return new Response(JSON.stringify(uploadResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    return new Response("Error uploading image response", { status: 500 });
  }
}
