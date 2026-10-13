import { apiError, apiOk, errorResponse, parseBody } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth/dal";
import { createTagSchema } from "@/features/tags/schemas";
import { createTag } from "@/features/tags/service";
import { listTags } from "@/features/tags/queries";

export async function GET() {
  try {
    const me = await getCurrentUser();
    if (!me) return apiError("UNAUTHORIZED", "No has iniciado sesión.");

    const tags = await listTags();
    return apiOk(tags);
  } catch (err) {
    return errorResponse(err);
  }
}

export async function POST(request: Request) {
  try {
    const me = await getCurrentUser();
    if (!me) return apiError("UNAUTHORIZED", "No has iniciado sesión.");

    const input = await parseBody(request, createTagSchema);
    const tag = await createTag(input);
    return apiOk(tag, 201);
  } catch (err) {
    return errorResponse(err);
  }
}
