import { apiError, apiOk, errorResponse } from "../../../../../lib/api";
import { getCurrentUser } from "../../../../../lib/auth/dal";
import { markNotificationRead } from "../../../../../features/notifications/service";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(_request: Request, { params }: Params) {
  try {
    const me = await getCurrentUser();
    if (!me) return apiError("UNAUTHORIZED", "No has iniciado sesión.");

    const { id } = await params;
    await markNotificationRead(me.id, id);
    return apiOk({ ok: true });
  } catch (err) {
    return errorResponse(err);
  }
}
