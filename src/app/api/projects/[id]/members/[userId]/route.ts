import { apiError, apiOk, errorResponse, parseBody } from "../../../../../../lib/api";
import { getCurrentUser } from "../../../../../../lib/auth/dal";
import { changeMemberRoleSchema } from "../../../../../../features/members/schemas";
import { changeMemberRole, removeMember } from "../../../../../../features/members/service";

type Params = { params: Promise<{ id: string; userId: string }> };

export async function PATCH(request: Request, { params }: Params) {
  try {
    const me = await getCurrentUser();
    if (!me) return apiError("UNAUTHORIZED", "No has iniciado sesión.");

    const { id, userId } = await params;
    const input = await parseBody(request, changeMemberRoleSchema);
    await changeMemberRole(me.id, id, userId, input.role);
    return apiOk({ ok: true });
  } catch (err) {
    return errorResponse(err);
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const me = await getCurrentUser();
    if (!me) return apiError("UNAUTHORIZED", "No has iniciado sesión.");

    const { id, userId } = await params;
    await removeMember(me.id, id, userId);
    return apiOk({ ok: true });
  } catch (err) {
    return errorResponse(err);
  }
}
