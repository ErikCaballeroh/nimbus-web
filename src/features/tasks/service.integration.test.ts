import { randomUUID } from "node:crypto";
import { afterAll, describe, expect, it } from "vitest";
import { db } from "@/lib/db";
import type { ApiError } from "@/lib/api";
import { createProject } from "@/features/projects/service";
import { createTask, deleteTask, updateTask, updateTaskStatus } from "./service";

async function createUser() {
  return db.user.create({
    data: { name: "Test User", email: `test-${randomUUID()}@nimbus.test`, passwordHash: "x" },
  });
}

async function createProjectWithRole(role: "admin" | "editor" | "viewer") {
  const owner = await createUser();
  const member = await createUser();
  const project = await createProject(owner.id, { name: "Proyecto de prueba" });
  await db.projectMember.create({ data: { projectId: project.id, userId: member.id, role } });
  return { owner, member, project };
}

afterAll(async () => {
  await db.$disconnect();
});

describe("createTask", () => {
  it("assigns sequential codes per project, using the project's prefix", async () => {
    const { owner, project } = await createProjectWithRole("editor");
    const first = await createTask(owner.id, project.id, { title: "Primera tarea" });
    const second = await createTask(owner.id, project.id, { title: "Segunda tarea" });

    const dbProject = await db.project.findUniqueOrThrow({ where: { id: project.id } });
    expect(first.code).toBe(`${dbProject.codePrefix}-1`);
    expect(second.code).toBe(`${dbProject.codePrefix}-2`);
  });

  it("keeps separate sequences for different projects", async () => {
    const owner = await createUser();
    const projectA = await createProject(owner.id, { name: "Proyecto A" });
    const projectB = await createProject(owner.id, { name: "Proyecto B" });

    const taskA = await createTask(owner.id, projectA.id, { title: "Tarea A" });
    const taskB = await createTask(owner.id, projectB.id, { title: "Tarea B" });

    const [dbProjectA, dbProjectB] = await Promise.all([
      db.project.findUniqueOrThrow({ where: { id: projectA.id } }),
      db.project.findUniqueOrThrow({ where: { id: projectB.id } }),
    ]);
    expect(taskA.code).toBe(`${dbProjectA.codePrefix}-1`);
    expect(taskB.code).toBe(`${dbProjectB.codePrefix}-1`);
  });

  it("rejects an assignee who isn't a project member with VALIDATION_ERROR", async () => {
    const { owner, project } = await createProjectWithRole("editor");
    const outsider = await createUser();

    await expect(
      createTask(owner.id, project.id, { title: "Tarea", assigneeId: outsider.id })
    ).rejects.toMatchObject({ code: "VALIDATION_ERROR" } satisfies Partial<ApiError>);
  });

  it("allows an editor to create a task", async () => {
    const { member, project } = await createProjectWithRole("editor");
    const task = await createTask(member.id, project.id, { title: "Tarea" });
    expect(task.title).toBe("Tarea");
  });

  it("rejects a viewer with FORBIDDEN", async () => {
    const { member, project } = await createProjectWithRole("viewer");
    await expect(
      createTask(member.id, project.id, { title: "Tarea" })
    ).rejects.toMatchObject({ code: "FORBIDDEN" } satisfies Partial<ApiError>);
  });

  it("rejects a non-member with NOT_FOUND", async () => {
    const outsider = await createUser();
    const owner = await createUser();
    const project = await createProject(owner.id, { name: "Proyecto" });

    await expect(
      createTask(outsider.id, project.id, { title: "Tarea" })
    ).rejects.toMatchObject({ code: "NOT_FOUND" } satisfies Partial<ApiError>);
  });
});

describe("updateTaskStatus", () => {
  it("allows an editor to change the status", async () => {
    const { owner, member, project } = await createProjectWithRole("editor");
    const task = await createTask(owner.id, project.id, { title: "Tarea" });

    const updated = await updateTaskStatus(member.id, task.id, { status: "in_progress" });
    expect(updated.status).toBe("in_progress");
  });

  it("rejects a viewer with FORBIDDEN", async () => {
    const { owner, member, project } = await createProjectWithRole("viewer");
    const task = await createTask(owner.id, project.id, { title: "Tarea" });

    await expect(
      updateTaskStatus(member.id, task.id, { status: "in_progress" })
    ).rejects.toMatchObject({ code: "FORBIDDEN" } satisfies Partial<ApiError>);
  });
});

describe("updateTask", () => {
  it("rejects a new assignee who isn't a project member", async () => {
    const { owner, project } = await createProjectWithRole("editor");
    const task = await createTask(owner.id, project.id, { title: "Tarea" });
    const outsider = await createUser();

    await expect(
      updateTask(owner.id, task.id, { assigneeId: outsider.id })
    ).rejects.toMatchObject({ code: "VALIDATION_ERROR" } satisfies Partial<ApiError>);
  });
});

describe("deleteTask", () => {
  it("rejects an editor with FORBIDDEN", async () => {
    const { owner, member, project } = await createProjectWithRole("editor");
    const task = await createTask(owner.id, project.id, { title: "Tarea" });

    await expect(deleteTask(member.id, task.id)).rejects.toMatchObject({ code: "FORBIDDEN" } satisfies Partial<ApiError>);
  });

  it("allows an admin to delete", async () => {
    const { owner, member, project } = await createProjectWithRole("admin");
    const task = await createTask(owner.id, project.id, { title: "Tarea" });

    await deleteTask(member.id, task.id);
    const found = await db.task.findUnique({ where: { id: task.id } });
    expect(found).toBeNull();
  });
});
