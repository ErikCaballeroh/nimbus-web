import "server-only";
import { db } from "@/lib/db";
import { ApiError } from "@/lib/api";
import { assertProjectRole, TASK_ACTION_MIN_ROLE } from "@/lib/permissions";
import type { Comment } from "./types";

export async function listCommentsForTask(userId: string, taskId: string): Promise<Comment[]> {
  const task = await db.task.findUnique({ where: { id: taskId }, select: { projectId: true } });
  if (!task) throw new ApiError("NOT_FOUND", "Tarea no encontrada.");

  await assertProjectRole(userId, task.projectId, TASK_ACTION_MIN_ROLE.viewTasks);

  const rows = await db.comment.findMany({
    where: { taskId },
    select: {
      id: true,
      taskId: true,
      authorId: true,
      text: true,
      createdAt: true,
      author: { select: { name: true, avatarColor: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  return rows.map((r) => ({
    id: r.id,
    taskId: r.taskId,
    authorId: r.authorId,
    authorName: r.author.name,
    authorAvatarColor: r.author.avatarColor,
    text: r.text,
    createdAt: r.createdAt.toISOString(),
  }));
}
