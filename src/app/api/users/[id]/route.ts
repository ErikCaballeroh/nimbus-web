import { apiError, apiOk, errorResponse } from "../../../../lib/api";
import { getCurrentUser } from "../../../../lib/auth/dal";
import { getUser } from "../../../../features/users/queries";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  try {
    const me = await getCurrentUser();
    if (!me) return apiError("UNAUTHORIZED", "No has iniciado sesión.");

    const { id } = await params;
    const user = await getUser(id);
    return apiOk(user);
  } catch (err) {
    return errorResponse(err);
  }
}
