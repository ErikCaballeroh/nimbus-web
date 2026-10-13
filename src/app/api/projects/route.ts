import { apiError, apiOk, errorResponse, parseBody } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth/dal";
import { createProjectSchema } from "@/features/projects/schemas";
import { createProject } from "@/features/projects/service";
import { listProjectsForUser } from "@/features/projects/queries";

export async function GET() {
  try {
    const me = await getCurrentUser();
    if (!me) return apiError("UNAUTHORIZED", "No has iniciado sesión.");

    const projects = await listProjectsForUser(me.id);
    return apiOk(projects);
  } catch (err) {
    return errorResponse(err);
  }
}

export async function POST(request: Request) {
  try {
    const me = await getCurrentUser();
    if (!me) return apiError("UNAUTHORIZED", "No has iniciado sesión.");

    const input = await parseBody(request, createProjectSchema);
    const project = await createProject(me.id, input);
    return apiOk(project, 201);
  } catch (err) {
    return errorResponse(err);
  }
}
