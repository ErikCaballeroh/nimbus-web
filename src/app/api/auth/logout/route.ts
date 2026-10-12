import { apiError, apiOk, errorResponse } from "../../../../lib/api";
import { getCurrentUser } from "../../../../lib/auth/dal";
import { destroySession } from "../../../../lib/auth/session";

export async function POST() {
  try {
    const user = await getCurrentUser();
    if (!user) return apiError("UNAUTHORIZED", "No has iniciado sesión.");

    await destroySession();
    return apiOk({ ok: true });
  } catch (err) {
    return errorResponse(err);
  }
}
