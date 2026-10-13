import type { Priority, Status } from "@/features/tasks/types";

export interface UpcomingTask {
  id: string;
  title: string;
  dueDate: string;
  priority: Priority;
  status: Status;
  overdue: boolean;
}

export interface ProjectProgress {
  id: string;
  name: string;
  total: number;
  done: number;
}

export interface DashboardSummary {
  activeProjects: number;
  totalTasks: number;
  doneTasks: number;
  overdueTasks: number;
  dueNext7Days: number;
  tasksByStatus: Record<Status, number>;
  tasksByPriority: Record<Priority, number>;
  projectsProgress: ProjectProgress[];
  upcomingTasks: UpcomingTask[];
}
