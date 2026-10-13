import "server-only";
import { db } from "../../lib/db";
import { ApiError } from "../../lib/api";
import { assertProjectRole, TASK_ACTION_MIN_ROLE } from "../../lib/permissions";
import { es } from "../../lib/i18n/es";
import { notify } from "../notifications/service";
import { listCommentsForTask } from "./queries";
import type { Comment } from "./types";
import type { CreateCommentInput } from "./schemas";

export async function addComment(userId: string, taskId: string, input: CreateCommentInput): Promise<Comment> {
  const task = await db.task.findUnique({
    where: { id: taskId },
    select: { projectId: true, title: true, assigneeId: true, createdBy: true },
  });
  if (!task) throw new ApiError("NOT_FOUND", "Tarea no encontrada.");

  await assertProjectRole(userId, task.projectId, TASK_ACTION_MIN_ROLE.addComment);

  const created = await db.comment.create({
    data: { taskId, authorId: userId, text: input.text },
    select: { id: true },
  });

  // Notify whoever is assigned to or created the task — never the commenter.
  const recipients = new Set([task.assigneeId, task.createdBy].filter((id): id is string => !!id));
  for (const recipientId of recipients) {
    await notify({
      recipientId,
      actorId: userId,
      type: "comment",
      text: es.notifications.comment(task.title),
      projectId: task.projectId,
      taskId,
    });
  }

  const comments = await listCommentsForTask(userId, taskId);
  return comments.find((c) => c.id === created.id)!;
}

export async function deleteComment(userId: string, commentId: string): Promise<void> {
  const comment = await db.comment.findUnique({
    where: { id: commentId },
    select: { authorId: true, task: { select: { projectId: true } } },
  });
  if (!comment) throw new ApiError("NOT_FOUND", "Comentario no encontrado.");

  const minRole = comment.authorId === userId
    ? TASK_ACTION_MIN_ROLE.deleteOwnComment
    : TASK_ACTION_MIN_ROLE.deleteAnyComment;
  await assertProjectRole(userId, comment.task.projectId, minRole);

  await db.comment.delete({ where: { id: commentId } });
}
