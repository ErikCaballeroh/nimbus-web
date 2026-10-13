import { apiError, apiOk, errorResponse } from "../../../lib/api";
import { getCurrentUser } from "../../../lib/auth/dal";
import { getTeamForUser } from "../../../features/team/queries";

export async function GET() {
  try {
    const me = await getCurrentUser();
    if (!me) return apiError("UNAUTHORIZED", "No has iniciado sesión.");

    const team = await getTeamForUser(me.id);
    return apiOk(team);
  } catch (err) {
    return errorResponse(err);
  }
}
