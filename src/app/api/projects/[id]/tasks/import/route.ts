import { apiError, apiOk, errorResponse } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth/dal";
import { importTasks } from "@/features/import-export/service";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  try {
    const me = await getCurrentUser();
    if (!me) return apiError("UNAUTHORIZED", "No has iniciado sesión.");

    const { id } = await params;
    const formData = await request.formData().catch(() => null);
    const file = formData?.get("file");
    if (!(file instanceof File)) {
      return apiError("VALIDATION_ERROR", "Falta el archivo a importar.");
    }

    const result = await importTasks(me.id, id, file);
    return apiOk(result);
  } catch (err) {
    return errorResponse(err);
  }
}
