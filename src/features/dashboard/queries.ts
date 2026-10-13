import "server-only";
import { db } from "../../lib/db";
import { statusOrder, type Priority, type Status } from "../tasks/types";
import { listProjectsForUser } from "../projects/queries";
import type { DashboardSummary } from "./types";

const priorityOrder: Priority[] = ["low", "medium", "high", "urgent"];

export async function getDashboardSummary(userId: string): Promise<DashboardSummary> {
  const projects = await listProjectsForUser(userId);
  const projectIds = projects.map((p) => p.id);

  const startOfToday = new Date();
  startOfToday.setUTCHours(0, 0, 0, 0);
  const in7Days = new Date(startOfToday);
  in7Days.setUTCDate(in7Days.getUTCDate() + 7);

  if (projectIds.length === 0) {
    return {
      activeProjects: 0,
      totalTasks: 0,
      doneTasks: 0,
      overdueTasks: 0,
      dueNext7Days: 0,
      tasksByStatus: { todo: 0, in_progress: 0, review: 0, done: 0 },
      tasksByPriority: { low: 0, medium: 0, high: 0, urgent: 0 },
      projectsProgress: [],
      upcomingTasks: [],
    };
  }

  const [statusRows, priorityRows, overdueTasks, dueNext7Days, upcomingRows] = await Promise.all([
    db.task.groupBy({ by: ["status"], where: { projectId: { in: projectIds } }, _count: { _all: true } }),
    db.task.groupBy({ by: ["priority"], where: { projectId: { in: projectIds } }, _count: { _all: true } }),
    db.task.count({
      where: { projectId: { in: projectIds }, status: { not: "done" }, dueDate: { lt: startOfToday } },
    }),
    db.task.count({
      where: {
        projectId: { in: projectIds },
        status: { not: "done" },
        dueDate: { gte: startOfToday, lte: in7Days },
      },
    }),
    db.task.findMany({
      where: { projectId: { in: projectIds }, status: { not: "done" }, dueDate: { not: null } },
      select: { id: true, title: true, dueDate: true, priority: true, status: true },
      orderBy: { dueDate: "asc" },
      take: 5,
    }),
  ]);

  const tasksByStatus = Object.fromEntries(statusOrder.map((s) => [s, 0])) as Record<Status, number>;
  for (const row of statusRows) tasksByStatus[row.status] = row._count._all;

  const tasksByPriority = Object.fromEntries(priorityOrder.map((p) => [p, 0])) as Record<Priority, number>;
  for (const row of priorityRows) tasksByPriority[row.priority] = row._count._all;

  const totalTasks = Object.values(tasksByStatus).reduce((a, b) => a + b, 0);

  return {
    activeProjects: projects.length,
    totalTasks,
    doneTasks: tasksByStatus.done,
    overdueTasks,
    dueNext7Days,
    tasksByStatus,
    tasksByPriority,
    projectsProgress: projects.map((p) => ({ id: p.id, name: p.name, total: p.taskCount, done: p.doneTaskCount })),
    upcomingTasks: upcomingRows.map((t) => ({
      id: t.id,
      title: t.title,
      dueDate: t.dueDate!.toISOString(),
      priority: t.priority,
      status: t.status,
      overdue: t.dueDate! < startOfToday,
    })),
  };
}
