import { apiError, apiOk, errorResponse, parseBody } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth/dal";
import { updateProfileSchema } from "@/features/auth/schemas";
import { updateProfile } from "@/features/auth/service";

export async function PATCH(request: Request) {
  try {
    const me = await getCurrentUser();
    if (!me) return apiError("UNAUTHORIZED", "No has iniciado sesión.");

    const input = await parseBody(request, updateProfileSchema);
    const user = await updateProfile(me.id, input);
    return apiOk(user);
  } catch (err) {
    return errorResponse(err);
  }
}
