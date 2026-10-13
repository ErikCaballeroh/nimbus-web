export type NotificationType = "assigned" | "comment" | "status" | "member" | "due";

export interface Notification {
  id: string;
  type: NotificationType;
  // null for notifications with no human actor (e.g. "due" reminders).
  actorId: string | null;
  actorName: string | null;
  actorAvatarColor: string | null;
  text: string;
  createdAt: string;
  read: boolean;
  projectId: string | null;
  taskId: string | null;
}
