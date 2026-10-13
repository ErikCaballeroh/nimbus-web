import { apiError, apiOk, errorResponse, parseBody } from "../../../../../lib/api";
import { getCurrentUser } from "../../../../../lib/auth/dal";
import { updateTaskStatusSchema } from "../../../../../features/tasks/schemas";
import { updateTaskStatus } from "../../../../../features/tasks/service";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  try {
    const me = await getCurrentUser();
    if (!me) return apiError("UNAUTHORIZED", "No has iniciado sesión.");

    const { id } = await params;
    const input = await parseBody(request, updateTaskStatusSchema);
    const task = await updateTaskStatus(me.id, id, input);
    return apiOk(task);
  } catch (err) {
    return errorResponse(err);
  }
}
