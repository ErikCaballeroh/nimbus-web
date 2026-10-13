import "server-only";
import { db } from "../../lib/db";
import { ApiError } from "../../lib/api";
import { es } from "../../lib/i18n/es";
import type { NotificationType } from "./types";

interface NotifyInput {
  recipientId: string;
  // null for a system-generated notification with no human actor (e.g. a
  // "due" reminder); never equal to recipientId otherwise — see the guard
  // below ("never notify the actor about their own action").
  actorId: string | null;
  type: NotificationType;
  text: string;
  projectId?: string;
  taskId?: string;
}

export async function notify(input: NotifyInput): Promise<void> {
  if (input.actorId && input.actorId === input.recipientId) return;

  await db.notification.create({
    data: {
      recipientId: input.recipientId,
      actorId: input.actorId,
      type: input.type,
      text: input.text,
      projectId: input.projectId,
      taskId: input.taskId,
    },
  });
}

export async function markNotificationRead(userId: string, notificationId: string): Promise<void> {
  const notification = await db.notification.findUnique({
    where: { id: notificationId },
    select: { recipientId: true },
  });
  // Not found or belongs to someone else: 404 either way, don't leak which.
  if (!notification || notification.recipientId !== userId) {
    throw new ApiError("NOT_FOUND", "Notificación no encontrada.");
  }

  await db.notification.update({ where: { id: notificationId }, data: { read: true } });
}

export async function markAllNotificationsRead(userId: string): Promise<void> {
  await db.notification.updateMany({ where: { recipientId: userId, read: false }, data: { read: true } });
}

/**
 * Notifies each assignee whose task is due tomorrow (and not yet done), for
 * a scheduled job to call once a day. Skips a task that already got a "due"
 * notification today, so re-running the job the same day doesn't duplicate.
 */
export async function sendDueReminders(): Promise<{ notified: number }> {
  const todayStart = new Date();
  todayStart.setUTCHours(0, 0, 0, 0);
  const tomorrowStart = new Date(todayStart);
  tomorrowStart.setUTCDate(tomorrowStart.getUTCDate() + 1);
  const dayAfterTomorrowStart = new Date(tomorrowStart);
  dayAfterTomorrowStart.setUTCDate(dayAfterTomorrowStart.getUTCDate() + 1);

  const dueTasks = await db.task.findMany({
    where: {
      status: { not: "done" },
      assigneeId: { not: null },
      dueDate: { gte: tomorrowStart, lt: dayAfterTomorrowStart },
    },
    select: { id: true, title: true, assigneeId: true, projectId: true },
  });

  let notified = 0;
  for (const task of dueTasks) {
    const alreadySentToday = await db.notification.findFirst({
      where: { taskId: task.id, type: "due", createdAt: { gte: todayStart } },
      select: { id: true },
    });
    if (alreadySentToday) continue;

    await notify({
      recipientId: task.assigneeId!,
      actorId: null,
      type: "due",
      text: es.notifications.due(task.title),
      projectId: task.projectId,
      taskId: task.id,
    });
    notified++;
  }

  return { notified };
}
