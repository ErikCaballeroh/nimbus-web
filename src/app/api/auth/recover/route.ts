import { apiOk, errorResponse, parseBody } from "@/lib/api";
import { assertRateLimit } from "@/lib/rateLimit";
import { recoverSchema } from "@/features/auth/schemas";
import { requestPasswordReset } from "@/features/auth/service";

export async function POST(request: Request) {
  try {
    assertRateLimit(request, "recover");
    const input = await parseBody(request, recoverSchema);
    await requestPasswordReset(input.email);
    // Always 200, whether or not the email exists, so we don't leak which emails are registered.
    return apiOk({ ok: true });
  } catch (err) {
    return errorResponse(err);
  }
}
