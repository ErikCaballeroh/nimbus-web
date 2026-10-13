import { apiError, errorResponse } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth/dal";
import { exportTasks } from "@/features/import-export/service";
import { exportQuerySchema } from "@/features/import-export/schemas";
import { rowsToCsv, rowsToXlsx } from "@/features/import-export/parsers";

type Params = { params: Promise<{ id: string }> };

export async function GET(request: Request, { params }: Params) {
  try {
    const me = await getCurrentUser();
    if (!me) return apiError("UNAUTHORIZED", "No has iniciado sesión.");

    const { id } = await params;
    const searchParams = new URL(request.url).searchParams;
    const result = exportQuerySchema.safeParse({ format: searchParams.get("format") ?? undefined });
    if (!result.success) {
      return apiError("VALIDATION_ERROR", "Formato no soportado.", result.error.issues);
    }

    const { tasks, assigneeEmails, format } = await exportTasks(me.id, id, result.data.format);
    const filename = `tareas-nimbus.${format}`;

    if (format === "csv") {
      return new Response(rowsToCsv(tasks, assigneeEmails), {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="${filename}"`,
        },
      });
    }

    const buffer = await rowsToXlsx(tasks, assigneeEmails);
    return new Response(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (err) {
    return errorResponse(err);
  }
}
