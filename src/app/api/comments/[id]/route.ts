import { apiError, apiOk, errorResponse } from "../../../../lib/api";
import { getCurrentUser } from "../../../../lib/auth/dal";
import { deleteComment } from "../../../../features/comments/service";

type Params = { params: Promise<{ id: string }> };

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const me = await getCurrentUser();
    if (!me) return apiError("UNAUTHORIZED", "No has iniciado sesión.");

    const { id } = await params;
    await deleteComment(me.id, id);
    return apiOk({ ok: true });
  } catch (err) {
    return errorResponse(err);
  }
}
