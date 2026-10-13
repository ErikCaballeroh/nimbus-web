import { apiError, apiOk, errorResponse, parseBody } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth/dal";
import { updateProjectSchema } from "@/features/projects/schemas";
import { deleteProject, updateProject } from "@/features/projects/service";
import { getProjectForUser } from "@/features/projects/queries";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  try {
    const me = await getCurrentUser();
    if (!me) return apiError("UNAUTHORIZED", "No has iniciado sesión.");

    const { id } = await params;
    const project = await getProjectForUser(me.id, id);
    return apiOk(project);
  } catch (err) {
    return errorResponse(err);
  }
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    const me = await getCurrentUser();
    if (!me) return apiError("UNAUTHORIZED", "No has iniciado sesión.");

    const { id } = await params;
    const input = await parseBody(request, updateProjectSchema);
    const project = await updateProject(me.id, id, input);
    return apiOk(project);
  } catch (err) {
    return errorResponse(err);
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const me = await getCurrentUser();
    if (!me) return apiError("UNAUTHORIZED", "No has iniciado sesión.");

    const { id } = await params;
    await deleteProject(me.id, id);
    return apiOk({ ok: true });
  } catch (err) {
    return errorResponse(err);
  }
}
