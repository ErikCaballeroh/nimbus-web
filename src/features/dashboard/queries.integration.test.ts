import { randomUUID } from "node:crypto";
import { afterAll, describe, expect, it } from "vitest";
import { db } from "../../lib/db";
import { createProject } from "../projects/service";
import { createTask, updateTaskStatus } from "../tasks/service";
import { getDashboardSummary } from "./queries";

async function createUser() {
  return db.user.create({
    data: { name: "Test User", email: `test-${randomUUID()}@nimbus.test`, passwordHash: "x" },
  });
}

afterAll(async () => {
  await db.$disconnect();
});

function isoDaysFromNow(days: number): string {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

describe("getDashboardSummary", () => {
  it("returns zeroed stats for a user with no projects", async () => {
    const user = await createUser();
    const summary = await getDashboardSummary(user.id);

    expect(summary).toMatchObject({
      activeProjects: 0,
      totalTasks: 0,
      doneTasks: 0,
      overdueTasks: 0,
      dueNext7Days: 0,
      projectsProgress: [],
      upcomingTasks: [],
    });
  });

  it("aggregates tasks by status/priority, overdue, due-soon and per-project progress", async () => {
    const owner = await createUser();
    const project = await createProject(owner.id, { name: "Proyecto de métricas" });

    const overdueTask = await createTask(owner.id, project.id, {
      title: "Tarea atrasada",
      priority: "urgent",
      dueDate: isoDaysFromNow(-3),
    });
    await createTask(owner.id, project.id, {
      title: "Tarea próxima",
      priority: "high",
      dueDate: isoDaysFromNow(2),
    });
    const doneTask = await createTask(owner.id, project.id, { title: "Tarea hecha", priority: "low" });
    await updateTaskStatus(owner.id, doneTask.id, { status: "done" });

    const summary = await getDashboardSummary(owner.id);

    expect(summary.activeProjects).toBe(1);
    expect(summary.totalTasks).toBe(3);
    expect(summary.doneTasks).toBe(1);
    expect(summary.overdueTasks).toBe(1);
    expect(summary.dueNext7Days).toBe(1);
    expect(summary.tasksByStatus.done).toBe(1);
    expect(summary.tasksByStatus.todo).toBe(2);
    expect(summary.tasksByPriority.urgent).toBe(1);
    expect(summary.tasksByPriority.high).toBe(1);
    expect(summary.tasksByPriority.low).toBe(1);
    expect(summary.projectsProgress).toEqual([{ id: project.id, name: project.name, total: 3, done: 1 }]);

    const upcomingIds = summary.upcomingTasks.map((t) => t.id);
    expect(upcomingIds).toContain(overdueTask.id);
    const overdueEntry = summary.upcomingTasks.find((t) => t.id === overdueTask.id);
    expect(overdueEntry?.overdue).toBe(true);
  });
});
