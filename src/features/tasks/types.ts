export type Priority = "low" | "medium" | "high" | "urgent";
export type Status = "todo" | "in_progress" | "review" | "done";

export interface Comment {
  id: string;
  authorId: string;
  text: string;
  time: string;
}

export interface Task {
  id: string;
  code: string;
  title: string;
  description: string;
  status: Status;
  priority: Priority;
  assigneeId: string | null;
  due: string; // ISO
  projectId: string;
  comments: Comment[];
  tags: string[];
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
