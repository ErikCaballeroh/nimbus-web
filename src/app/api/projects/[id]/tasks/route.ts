import { apiError, apiOk, errorResponse, parseBody } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth/dal";
import { createTaskSchema, taskFiltersSchema } from "@/features/tasks/schemas";
import { createTask } from "@/features/tasks/service";
import { listTasksForProject } from "@/features/tasks/queries";

type Params = { params: Promise<{ id: string }> };

export async function GET(request: Request, { params }: Params) {
  try {
    const me = await getCurrentUser();
    if (!me) return apiError("UNAUTHORIZED", "No has iniciado sesión.");

    const { id } = await params;
    const searchParams = new URL(request.url).searchParams;
    const result = taskFiltersSchema.safeParse({
      status: searchParams.get("status") ?? undefined,
      assignee: searchParams.get("assignee") ?? undefined,
      priority: searchParams.get("priority") ?? undefined,
    });
    if (!result.success) {
      return apiError("VALIDATION_ERROR", "Filtros no válidos.", result.error.issues);
    }
    const tasks = await listTasksForProject(me.id, id, result.data);
    return apiOk(tasks);
  } catch (err) {
    return errorResponse(err);
  }
}

export async function POST(request: Request, { params }: Params) {
  try {
    const me = await getCurrentUser();
    if (!me) return apiError("UNAUTHORIZED", "No has iniciado sesión.");

    const { id } = await params;
    const input = await parseBody(request, createTaskSchema);
    const task = await createTask(me.id, id, input);
    return apiOk(task, 201);
  } catch (err) {
    return errorResponse(err);
  }
}
