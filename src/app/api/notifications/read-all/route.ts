import { apiError, apiOk, errorResponse } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth/dal";
import { markAllNotificationsRead } from "@/features/notifications/service";

export async function PATCH() {
  try {
    const me = await getCurrentUser();
    if (!me) return apiError("UNAUTHORIZED", "No has iniciado sesión.");

    await markAllNotificationsRead(me.id);
    return apiOk({ ok: true });
  } catch (err) {
    return errorResponse(err);
  }
}
