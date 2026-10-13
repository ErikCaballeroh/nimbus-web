import { apiError, apiOk, errorResponse } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth/dal";
import { getDashboardSummary } from "@/features/dashboard/queries";

export async function GET() {
  try {
    const me = await getCurrentUser();
    if (!me) return apiError("UNAUTHORIZED", "No has iniciado sesión.");

    const summary = await getDashboardSummary(me.id);
    return apiOk(summary);
  } catch (err) {
    return errorResponse(err);
  }
}
