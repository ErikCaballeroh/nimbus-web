import "server-only";
import { db } from "@/lib/db";
import { ApiError } from "@/lib/api";
import { assertProjectRole, TASK_ACTION_MIN_ROLE } from "@/lib/permissions";
import { es } from "@/lib/i18n/es";
import { notify } from "@/features/notifications/service";
import { findOrCreateTagsByName } from "@/features/tags/service";
import { listTasksForProject } from "@/features/tasks/queries";
import type { Task } from "@/features/tasks/types";
import { parseCsv, parseXlsx, mapAndValidateRow, MAX_IMPORT_FILE_BYTES, MAX_IMPORT_ROWS, type RowResult } from "./parsers";
import type { ImportExportFormat } from "./schemas";

function extensionOf(filename: string): "csv" | "xlsx" | null {
  const lower = filename.toLowerCase();
  if (lower.endsWith(".csv")) return "csv";
  if (lower.endsWith(".xlsx")) return "xlsx";
  return null;
}

async function parseFile(file: File): Promise<RowResult[]> {
  const extension = extensionOf(file.name);
  if (!extension) {
    throw new ApiError("VALIDATION_ERROR", "Tipo de archivo no soportado. Usa .csv o .xlsx.");
  }
  if (file.size > MAX_IMPORT_FILE_BYTES) {
    throw new ApiError("VALIDATION_ERROR", "El archivo supera el tamaño máximo de 5 MB.");
  }

  const rawRows =
    extension === "csv" ? parseCsv(await file.text()) : await parseXlsx(await file.arrayBuffer());

  if (rawRows.length > MAX_IMPORT_ROWS) {
    throw new ApiError("VALIDATION_ERROR", "El archivo supera las 1000 filas permitidas.");
  }

  return rawRows.map((raw, i) => mapAndValidateRow(raw, i + 2));
}

async function resolveAssignee(projectId: string, email: string): Promise<string> {
  const user = await db.user.findUnique({ where: { email }, select: { id: true } });
  if (!user) {
    throw new ApiError("VALIDATION_ERROR", "El responsable no tiene una cuenta en Nimbus.");
  }
  const member = await db.projectMember.findUnique({
    where: { projectId_userId: { projectId, userId: user.id } },
    select: { userId: true },
  });
  if (!member) {
    throw new ApiError("VALIDATION_ERROR", "El responsable debe ser miembro del proyecto.");
  }
  return user.id;
}

export interface PreviewResult {
  rows: RowResult[];
  validCount: number;
  invalidCount: number;
}

export async function previewImport(userId: string, projectId: string, file: File): Promise<PreviewResult> {
  await assertProjectRole(userId, projectId, TASK_ACTION_MIN_ROLE.importTasks);
  const rows = await parseFile(file);

  for (const result of rows) {
    if (!result.valid || !result.data?.assigneeEmail) continue;
    try {
      await resolveAssignee(projectId, result.data.assigneeEmail);
    } catch (err) {
      result.valid = false;
      result.errors = [...(result.errors ?? []), err instanceof ApiError ? err.message : "Responsable no válido."];
    }
  }

  return {
    rows,
    validCount: rows.filter((r) => r.valid).length,
    invalidCount: rows.filter((r) => !r.valid).length,
  };
}

export interface ImportResult {
  imported: number;
  skipped: number;
  errors: { row: number; message: string }[];
}

export async function importTasks(userId: string, projectId: string, file: File): Promise<ImportResult> {
  await assertProjectRole(userId, projectId, TASK_ACTION_MIN_ROLE.importTasks);
  const rows = await parseFile(file);

  const errors: { row: number; message: string }[] = [];
  const validRows: { row: number; data: NonNullable<RowResult["data"]>; assigneeId: string | null }[] = [];

  for (const result of rows) {
    if (!result.valid || !result.data) {
      errors.push({ row: result.row, message: (result.errors ?? []).join(" ") });
      continue;
    }
    let assigneeId: string | null = null;
    if (result.data.assigneeEmail) {
      try {
        assigneeId = await resolveAssignee(projectId, result.data.assigneeEmail);
      } catch (err) {
        errors.push({ row: result.row, message: err instanceof ApiError ? err.message : "Responsable no válido." });
        continue;
      }
    }
    validRows.push({ row: result.row, data: result.data, assigneeId });
  }

  const allTagNames = [...new Set(validRows.flatMap((r) => r.data.tags))];
  const tags = await findOrCreateTagsByName(allTagNames);
  const tagIdByName = new Map(tags.map((t) => [t.name, t.id]));

  const created = await db.$transaction(async (tx) => {
    const rows: { taskId: string; title: string; assigneeId: string | null }[] = [];
    for (const row of validRows) {
      const [project] = await tx.$queryRaw<{ taskSeq: number; codePrefix: string }[]>`
        UPDATE projects SET task_seq = task_seq + 1 WHERE id = ${projectId}
        RETURNING task_seq AS "taskSeq", code_prefix AS "codePrefix"
      `;

      const task = await tx.task.create({
        data: {
          projectId,
          code: `${project.codePrefix}-${project.taskSeq}`,
          title: row.data.title,
          description: row.data.description,
          status: row.data.status ?? "todo",
          priority: row.data.priority ?? "medium",
          assigneeId: row.assigneeId ?? undefined,
          dueDate: row.data.dueDate ? new Date(row.data.dueDate) : undefined,
          createdBy: userId,
        },
      });

      const tagIds = row.data.tags.map((name) => tagIdByName.get(name)).filter((id): id is string => !!id);
      if (tagIds.length > 0) {
        await tx.taskTag.createMany({ data: tagIds.map((tagId) => ({ taskId: task.id, tagId })), skipDuplicates: true });
      }

      rows.push({ taskId: task.id, title: task.title, assigneeId: task.assigneeId });
    }
    return rows;
  });

  for (const task of created) {
    if (!task.assigneeId) continue;
    await notify({
      recipientId: task.assigneeId,
      actorId: userId,
      type: "assigned",
      text: es.notifications.assigned(task.title),
      projectId,
      taskId: task.taskId,
    });
  }

  return { imported: created.length, skipped: errors.length, errors };
}

export async function exportTasks(
  userId: string,
  projectId: string,
  format: ImportExportFormat
): Promise<{ tasks: Task[]; assigneeEmails: Record<string, string>; format: ImportExportFormat }> {
  await assertProjectRole(userId, projectId, TASK_ACTION_MIN_ROLE.exportTasks);
  const tasks = await listTasksForProject(userId, projectId, {});

  const assigneeIds = [...new Set(tasks.map((t) => t.assigneeId).filter((id): id is string => !!id))];
  const users = assigneeIds.length
    ? await db.user.findMany({ where: { id: { in: assigneeIds } }, select: { id: true, email: true } })
    : [];
  const assigneeEmails = Object.fromEntries(users.map((u) => [u.id, u.email]));

  return { tasks, assigneeEmails, format };
}
