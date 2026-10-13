import { apiError, apiOk, errorResponse, parseBody } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth/dal";
import { updatePasswordSchema } from "@/features/auth/schemas";
import { updatePassword } from "@/features/auth/service";

export async function PATCH(request: Request) {
  try {
    const me = await getCurrentUser();
    if (!me) return apiError("UNAUTHORIZED", "No has iniciado sesión.");

    const input = await parseBody(request, updatePasswordSchema);
    await updatePassword(me.id, input);
    return apiOk({ ok: true });
  } catch (err) {
    return errorResponse(err);
  }
}
