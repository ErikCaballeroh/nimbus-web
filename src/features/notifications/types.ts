export type NotificationType = "assigned" | "comment" | "status" | "member" | "due";

export interface Notification {
  id: string;
  type: NotificationType;
  actorId: string;
  text: string;
  time: string;
  read: boolean;
  projectId?: string;
}
