import { _createPasswordReset } from "@/lib/serverFunctions/serverActions/passwordResetUtil";

export async function POST(request: Request) {
  const formData = await request.formData();
  const response = await _createPasswordReset(formData);

  return Response.json({
    responseInfo: {
      statusCode: response.statusCode,
    },
    data: null,
  });
}
