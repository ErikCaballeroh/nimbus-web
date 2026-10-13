import { apiError, apiOk, errorResponse, parseBody } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth/dal";
import { updateTaskSchema } from "@/features/tasks/schemas";
import { deleteTask, updateTask } from "@/features/tasks/service";
import { getTaskForUser } from "@/features/tasks/queries";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  try {
    const me = await getCurrentUser();
    if (!me) return apiError("UNAUTHORIZED", "No has iniciado sesión.");

    const { id } = await params;
    const task = await getTaskForUser(me.id, id);
    return apiOk(task);
  } catch (err) {
    return errorResponse(err);
  }
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    const me = await getCurrentUser();
    if (!me) return apiError("UNAUTHORIZED", "No has iniciado sesión.");

    const { id } = await params;
    const input = await parseBody(request, updateTaskSchema);
    const task = await updateTask(me.id, id, input);
    return apiOk(task);
  } catch (err) {
    return errorResponse(err);
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const me = await getCurrentUser();
    if (!me) return apiError("UNAUTHORIZED", "No has iniciado sesión.");

    const { id } = await params;
    await deleteTask(me.id, id);
    return apiOk({ ok: true });
  } catch (err) {
    return errorResponse(err);
  }
}
