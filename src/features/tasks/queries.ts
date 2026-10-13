import "server-only";
import { db } from "@/lib/db";
import { ApiError } from "@/lib/api";
import { assertProjectRole, TASK_ACTION_MIN_ROLE } from "@/lib/permissions";
import type { Prisma } from "@/generated/prisma";
import type { Task } from "./types";
import type { TaskFilters } from "./schemas";

const taskSelect = {
  id: true,
  code: true,
  title: true,
  description: true,
  status: true,
  priority: true,
  assigneeId: true,
  dueDate: true,
  projectId: true,
  createdAt: true,
  updatedAt: true,
  assignee: { select: { id: true, name: true, avatarColor: true } },
  tags: { select: { tag: { select: { id: true, name: true, color: true } } } },
  _count: { select: { comments: true } },
} satisfies Prisma.TaskSelect;

type TaskRow = Prisma.TaskGetPayload<{ select: typeof taskSelect }>;

function toTask(row: TaskRow): Task {
  return {
    id: row.id,
    code: row.code,
    title: row.title,
    description: row.description ?? "",
    status: row.status,
    priority: row.priority,
    assigneeId: row.assigneeId,
    assignee: row.assignee,
    dueDate: row.dueDate?.toISOString() ?? null,
    projectId: row.projectId,
    tags: row.tags.map((t) => t.tag),
    commentCount: row._count.comments,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function listTasksForProject(userId: string, projectId: string, filters: TaskFilters): Promise<Task[]> {
  await assertProjectRole(userId, projectId, TASK_ACTION_MIN_ROLE.viewTasks);

  const rows = await db.task.findMany({
    where: {
      projectId,
      ...(filters.status ? { status: filters.status } : {}),
      ...(filters.assignee ? { assigneeId: filters.assignee } : {}),
      ...(filters.priority ? { priority: filters.priority } : {}),
    },
    select: taskSelect,
    orderBy: { createdAt: "desc" },
  });

  return rows.map(toTask);
}

/** Throws NOT_FOUND when the task doesn't exist or the caller isn't a member of its project. */
export async function getTaskForUser(userId: string, taskId: string): Promise<Task> {
  const row = await db.task.findUnique({ where: { id: taskId }, select: taskSelect });
  if (!row) throw new ApiError("NOT_FOUND", "Tarea no encontrada.");

  await assertProjectRole(userId, row.projectId, TASK_ACTION_MIN_ROLE.viewTasks);
  return toTask(row);
}
