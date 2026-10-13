import { apiOk, errorResponse, parseBody } from "@/lib/api";
import { assertRateLimit } from "@/lib/rateLimit";
import { createSession } from "@/lib/auth/session";
import { loginSchema } from "@/features/auth/schemas";
import { loginUser } from "@/features/auth/service";

export async function POST(request: Request) {
  try {
    assertRateLimit(request, "login");
    const input = await parseBody(request, loginSchema);
    const user = await loginUser(input);
    await createSession(user.id);
    return apiOk(user);
  } catch (err) {
    return errorResponse(err);
  }
}
