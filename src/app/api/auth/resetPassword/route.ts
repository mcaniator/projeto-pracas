import { _resetPassword } from "@/lib/serverFunctions/serverActions/passwordResetUtil";

export async function POST(request: Request) {
  const formData = await request.formData();
  const response = await _resetPassword(formData);

  return Response.json({
    responseInfo: {
      statusCode: response?.statusCode ?? 500,
    },
    data: {
      errorMessage: response?.errorMessage ?? null,
    },
  });
}
