import { apiOk, errorResponse, parseBody } from "@/lib/api";
import { createSession } from "@/lib/auth/session";
import { registerSchema } from "@/features/auth/schemas";
import { registerUser } from "@/features/auth/service";

export async function POST(request: Request) {
  try {
    const input = await parseBody(request, registerSchema);
    const user = await registerUser(input);
    await createSession(user.id);
    return apiOk(user, 201);
  } catch (err) {
    return errorResponse(err);
  }
}
