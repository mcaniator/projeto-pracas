import { requestPasswordReset } from "@/lib/serverFunctions/mutations/passwordResetUtil";
import superjson from "superjson";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const result = await requestPasswordReset({ data: formData });
    return new Response(superjson.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response("Internal Server Error", { status: 500 });
  }
}
