import { apiError, apiOk, errorResponse, parseBody } from "../../../../../lib/api";
import { getCurrentUser } from "../../../../../lib/auth/dal";
import { addMemberSchema } from "../../../../../features/members/schemas";
import { addMember } from "../../../../../features/members/service";
import { listProjectMembers } from "../../../../../features/members/queries";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  try {
    const me = await getCurrentUser();
    if (!me) return apiError("UNAUTHORIZED", "No has iniciado sesión.");

    const { id } = await params;
    const members = await listProjectMembers(me.id, id);
    return apiOk(members);
  } catch (err) {
    return errorResponse(err);
  }
}

export async function POST(request: Request, { params }: Params) {
  try {
    const me = await getCurrentUser();
    if (!me) return apiError("UNAUTHORIZED", "No has iniciado sesión.");

    const { id } = await params;
    const input = await parseBody(request, addMemberSchema);
    await addMember(me.id, id, input);
    return apiOk({ ok: true }, 201);
  } catch (err) {
    return errorResponse(err);
  }
}
