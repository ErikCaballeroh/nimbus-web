import type { Tag } from "@/features/tags/types";

export type Priority = "low" | "medium" | "high" | "urgent";
export type Status = "todo" | "in_progress" | "review" | "done";

export interface TaskAssignee {
  id: string;
  name: string;
  avatarColor: string;
}

export interface Task {
  id: string;
  code: string;
  title: string;
  description: string;
  status: Status;
  priority: Priority;
  assigneeId: string | null;
  assignee: TaskAssignee | null;
  dueDate: string | null; // ISO
  projectId: string;
  tags: Tag[];
  commentCount: number;
  createdAt: string;
  updatedAt: string;
}

export const statusOrder: Status[] = ["todo", "in_progress", "review", "done"];

export const statusAccent: Record<Status, string> = {
  todo: "#94a3b8",
  in_progress: "#4f46e5",
  review: "#d97706",
  done: "#16a34a",
};

export const priorityTone: Record<Priority, string> = {
  low: "var(--prio-low)",
  medium: "var(--prio-medium)",
  high: "var(--prio-high)",
  urgent: "var(--prio-urgent)",
};
