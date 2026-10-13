import { apiError, apiOk, errorResponse } from "../../../lib/api";
import { getCurrentUser } from "../../../lib/auth/dal";
import { searchUsers } from "../../../features/users/queries";

export async function GET(request: Request) {
  try {
    const me = await getCurrentUser();
    if (!me) return apiError("UNAUTHORIZED", "No has iniciado sesión.");

    const search = new URL(request.url).searchParams.get("search") ?? "";
    const users = await searchUsers(search);
    return apiOk(users);
  } catch (err) {
    return errorResponse(err);
  }
}
