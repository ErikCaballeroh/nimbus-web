import "server-only";
import { db } from "../../lib/db";
import type { Notification } from "./types";

const MAX_NOTIFICATIONS = 100;

export async function listNotificationsForUser(userId: string): Promise<Notification[]> {
  const rows = await db.notification.findMany({
    where: { recipientId: userId },
    select: {
      id: true,
      type: true,
      actorId: true,
      text: true,
      createdAt: true,
      read: true,
      projectId: true,
      taskId: true,
      actor: { select: { name: true, avatarColor: true } },
    },
    orderBy: { createdAt: "desc" },
    take: MAX_NOTIFICATIONS,
  });

  return rows.map((r) => ({
    id: r.id,
    type: r.type,
    actorId: r.actorId,
    actorName: r.actor?.name ?? null,
    actorAvatarColor: r.actor?.avatarColor ?? null,
    text: r.text,
    createdAt: r.createdAt.toISOString(),
    read: r.read,
    projectId: r.projectId,
    taskId: r.taskId,
  }));
}
