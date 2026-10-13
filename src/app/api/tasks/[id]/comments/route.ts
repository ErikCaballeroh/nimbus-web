import { apiError, apiOk, errorResponse, parseBody } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth/dal";
import { createCommentSchema } from "@/features/comments/schemas";
import { addComment } from "@/features/comments/service";
import { listCommentsForTask } from "@/features/comments/queries";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  try {
    const me = await getCurrentUser();
    if (!me) return apiError("UNAUTHORIZED", "No has iniciado sesión.");

    const { id } = await params;
    const comments = await listCommentsForTask(me.id, id);
    return apiOk(comments);
  } catch (err) {
    return errorResponse(err);
  }
}

export async function POST(request: Request, { params }: Params) {
  try {
    const me = await getCurrentUser();
    if (!me) return apiError("UNAUTHORIZED", "No has iniciado sesión.");

    const { id } = await params;
    const input = await parseBody(request, createCommentSchema);
    const comment = await addComment(me.id, id, input);
    return apiOk(comment, 201);
  } catch (err) {
    return errorResponse(err);
  }
}
