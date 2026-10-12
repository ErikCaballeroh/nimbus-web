import { apiError, apiOk, errorResponse } from "../../../../lib/api";
import { getCurrentUser } from "../../../../lib/auth/dal";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return apiError("UNAUTHORIZED", "No has iniciado sesión.");
    return apiOk(user);
  } catch (err) {
    return errorResponse(err);
  }
}
