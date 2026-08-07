import { resetPassword } from "@/lib/serverFunctions/mutations/passwordResetUtil";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const result = await resetPassword(formData);
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response("Internal Server Error", { status: 500 });
  }
}
