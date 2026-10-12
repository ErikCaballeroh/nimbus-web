import { apiError, apiOk, errorResponse, parseBody } from "../../../../lib/api";
import { getCurrentUser } from "../../../../lib/auth/dal";
import { updateThemeSchema } from "../../../../features/auth/schemas";
import { updateTheme } from "../../../../features/auth/service";

export async function PATCH(request: Request) {
  try {
    const me = await getCurrentUser();
    if (!me) return apiError("UNAUTHORIZED", "No has iniciado sesión.");

    const { theme } = await parseBody(request, updateThemeSchema);
    const user = await updateTheme(me.id, theme);
    return apiOk(user);
  } catch (err) {
    return errorResponse(err);
  }
}
