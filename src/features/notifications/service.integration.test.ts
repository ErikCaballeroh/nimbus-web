import { randomUUID } from "node:crypto";
import { afterAll, describe, expect, it } from "vitest";
import { db } from "@/lib/db";
import type { ApiError } from "@/lib/api";
import { createProject } from "@/features/projects/service";
import { createTask, updateTaskStatus } from "@/features/tasks/service";
import { addComment } from "@/features/comments/service";
import { addMember } from "@/features/members/service";
import { markAllNotificationsRead, markNotificationRead, notify, sendDueReminders } from "./service";

async function createUser() {
  return db.user.create({
    data: { name: "Test User", email: `test-${randomUUID()}@nimbus.test`, passwordHash: "x" },
  });
}

async function createProjectWithEditor() {
  const owner = await createUser();
  const editor = await createUser();
  const project = await createProject(owner.id, { name: "Proyecto de prueba" });
  await db.projectMember.create({ data: { projectId: project.id, userId: editor.id, role: "editor" } });
  return { owner, editor, project };
}

function notificationsFor(userId: string) {
  return db.notification.findMany({ where: { recipientId: userId } });
}

afterAll(async () => {
  await db.$disconnect();
});

describe("notify", () => {
  it("never notifies the actor about their own action", async () => {
    const user = await createUser();
    await notify({ recipientId: user.id, actorId: user.id, type: "assigned", text: "test" });
    expect(await notificationsFor(user.id)).toHaveLength(0);
  });
});

describe("task assignment", () => {
  it("notifies the assignee when a task is created with one", async () => {
    const { owner, editor, project } = await createProjectWithEditor();
    const task = await createTask(owner.id, project.id, { title: "Tarea", assigneeId: editor.id });

    const notifications = await notificationsFor(editor.id);
    expect(notifications).toHaveLength(1);
    expect(notifications[0]).toMatchObject({ type: "assigned", actorId: owner.id, taskId: task.id });
  });

  it("doesn't notify when the creator assigns the task to themselves", async () => {
    const { owner, project } = await createProjectWithEditor();
    await createTask(owner.id, project.id, { title: "Tarea", assigneeId: owner.id });

    expect(await notificationsFor(owner.id)).toHaveLength(0);
  });
});

describe("task status change", () => {
  it("notifies the assignee of the new status", async () => {
    const { owner, editor, project } = await createProjectWithEditor();
    const task = await createTask(owner.id, project.id, { title: "Tarea", assigneeId: editor.id });

    await updateTaskStatus(owner.id, task.id, { status: "in_progress" });

    const notifications = await notificationsFor(editor.id);
    expect(notifications).toHaveLength(2); // assigned (on create) + status
    expect(notifications.some((n) => n.type === "status")).toBe(true);
  });

  it("doesn't notify when the assignee changes their own task's status", async () => {
    const { owner, editor, project } = await createProjectWithEditor();
    const task = await createTask(owner.id, project.id, { title: "Tarea", assigneeId: editor.id });

    await updateTaskStatus(editor.id, task.id, { status: "in_progress" });

    const notifications = await notificationsFor(editor.id);
    expect(notifications.every((n) => n.type !== "status")).toBe(true);
  });
});

describe("comments", () => {
  it("notifies the assignee and the creator, but not the commenter", async () => {
    const owner = await createUser();
    const assignee = await createUser();
    const commenter = await createUser();
    const project = await createProject(owner.id, { name: "Proyecto" });
    for (const u of [assignee, commenter]) {
      await db.projectMember.create({ data: { projectId: project.id, userId: u.id, role: "editor" } });
    }
    const task = await createTask(owner.id, project.id, { title: "Tarea", assigneeId: assignee.id });

    await addComment(commenter.id, task.id, { text: "Hola" });

    expect(await notificationsFor(commenter.id)).toHaveLength(0);
    const assigneeNotifs = await notificationsFor(assignee.id);
    expect(assigneeNotifs.some((n) => n.type === "comment")).toBe(true);
    const ownerNotifs = await notificationsFor(owner.id);
    expect(ownerNotifs.some((n) => n.type === "comment")).toBe(true);
  });

  it("notifies the creator only once when they're also the assignee", async () => {
    const owner = await createUser();
    const commenter = await createUser();
    const project = await createProject(owner.id, { name: "Proyecto" });
    await db.projectMember.create({ data: { projectId: project.id, userId: commenter.id, role: "editor" } });
    const task = await createTask(owner.id, project.id, { title: "Tarea", assigneeId: owner.id });

    await addComment(commenter.id, task.id, { text: "Hola" });

    const ownerNotifs = (await notificationsFor(owner.id)).filter((n) => n.type === "comment");
    expect(ownerNotifs).toHaveLength(1);
  });
});

describe("members", () => {
  it("notifies the new member", async () => {
    const owner = await createUser();
    const newMember = await createUser();
    const project = await createProject(owner.id, { name: "Proyecto" });

    await addMember(owner.id, project.id, { userId: newMember.id, role: "editor" });

    const notifications = await notificationsFor(newMember.id);
    expect(notifications).toHaveLength(1);
    expect(notifications[0]).toMatchObject({ type: "member", actorId: owner.id });
  });
});

describe("markNotificationRead / markAllNotificationsRead", () => {
  it("rejects marking someone else's notification as read", async () => {
    const recipient = await createUser();
    const outsider = await createUser();
    await notify({ recipientId: recipient.id, actorId: null, type: "due", text: "test" });
    const [n] = await notificationsFor(recipient.id);

    await expect(markNotificationRead(outsider.id, n.id)).rejects.toMatchObject({
      code: "NOT_FOUND",
    } satisfies Partial<ApiError>);
  });

  it("marks only the caller's unread notifications as read", async () => {
    const user = await createUser();
    const other = await createUser();
    await notify({ recipientId: user.id, actorId: null, type: "due", text: "a" });
    await notify({ recipientId: user.id, actorId: null, type: "due", text: "b" });
    await notify({ recipientId: other.id, actorId: null, type: "due", text: "c" });

    await markAllNotificationsRead(user.id);

    expect((await notificationsFor(user.id)).every((n) => n.read)).toBe(true);
    expect((await notificationsFor(other.id)).every((n) => !n.read)).toBe(true);
  });
});

describe("sendDueReminders", () => {
  it("notifies the assignee of a task due tomorrow and skips a repeat run the same day", async () => {
    const owner = await createUser();
    const assignee = await createUser();
    const project = await createProject(owner.id, { name: "Proyecto" });
    await db.projectMember.create({ data: { projectId: project.id, userId: assignee.id, role: "editor" } });
    const task = await createTask(owner.id, project.id, { title: "Tarea urgente", assigneeId: assignee.id });

    const tomorrow = new Date();
    tomorrow.setUTCHours(0, 0, 0, 0);
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
    await db.task.update({ where: { id: task.id }, data: { dueDate: tomorrow } });

    const first = await sendDueReminders();
    expect(first.notified).toBeGreaterThanOrEqual(1);

    const dueNotifs = (await notificationsFor(assignee.id)).filter((n) => n.type === "due" && n.taskId === task.id);
    expect(dueNotifs).toHaveLength(1);

    // Re-running the same day must not duplicate the reminder for this task.
    await sendDueReminders();
    const dueNotifsAfterRerun = (await notificationsFor(assignee.id)).filter(
      (n) => n.type === "due" && n.taskId === task.id
    );
    expect(dueNotifsAfterRerun).toHaveLength(1);
  });

  it("doesn't notify for a task that's already done", async () => {
    const owner = await createUser();
    const assignee = await createUser();
    const project = await createProject(owner.id, { name: "Proyecto" });
    await db.projectMember.create({ data: { projectId: project.id, userId: assignee.id, role: "editor" } });
    const task = await createTask(owner.id, project.id, { title: "Tarea completada", assigneeId: assignee.id });

    const tomorrow = new Date();
    tomorrow.setUTCHours(0, 0, 0, 0);
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
    await db.task.update({ where: { id: task.id }, data: { dueDate: tomorrow, status: "done" } });

    await sendDueReminders();
    const dueNotifs = (await notificationsFor(assignee.id)).filter((n) => n.type === "due" && n.taskId === task.id);
    expect(dueNotifs).toHaveLength(0);
  });
});
