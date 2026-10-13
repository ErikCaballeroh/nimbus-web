import { apiError, apiOk, errorResponse } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth/dal";
import { listNotificationsForUser } from "@/features/notifications/queries";

export async function GET() {
  try {
    const me = await getCurrentUser();
    if (!me) return apiError("UNAUTHORIZED", "No has iniciado sesión.");

    const notifications = await listNotificationsForUser(me.id);
    return apiOk(notifications);
  } catch (err) {
    return errorResponse(err);
  }
}
