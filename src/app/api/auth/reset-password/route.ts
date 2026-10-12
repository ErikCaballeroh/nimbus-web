import { apiOk, errorResponse, parseBody } from "../../../../lib/api";
import { resetPasswordSchema } from "../../../../features/auth/schemas";
import { resetPassword } from "../../../../features/auth/service";

export async function POST(request: Request) {
  try {
    const input = await parseBody(request, resetPasswordSchema);
    await resetPassword(input);
    return apiOk({ ok: true });
  } catch (err) {
    return errorResponse(err);
  }
}
