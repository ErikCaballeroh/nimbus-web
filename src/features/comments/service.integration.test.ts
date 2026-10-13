import { randomUUID } from "node:crypto";
import { afterAll, describe, expect, it } from "vitest";
import { db } from "../../lib/db";
import type { ApiError } from "../../lib/api";
import { createProject } from "../projects/service";
import { createTask } from "../tasks/service";
import { addComment, deleteComment } from "./service";

async function createUser() {
  return db.user.create({
    data: { name: "Test User", email: `test-${randomUUID()}@nimbus.test`, passwordHash: "x" },
  });
}

async function createTaskWithMember(role: "admin" | "editor" | "viewer") {
  const owner = await createUser();
  const member = await createUser();
  const project = await createProject(owner.id, { name: "Proyecto de prueba" });
  await db.projectMember.create({ data: { projectId: project.id, userId: member.id, role } });
  const task = await createTask(owner.id, project.id, { title: "Tarea" });
  return { owner, member, task };
}

afterAll(async () => {
  await db.$disconnect();
});

describe("addComment", () => {
  it("rejects a viewer with FORBIDDEN", async () => {
    const { member, task } = await createTaskWithMember("viewer");
    await expect(
      addComment(member.id, task.id, { text: "Hola" })
    ).rejects.toMatchObject({ code: "FORBIDDEN" } satisfies Partial<ApiError>);
  });
});

describe("deleteComment", () => {
  it("lets the author (editor) delete their own comment", async () => {
    const { member, task } = await createTaskWithMember("editor");
    const comment = await addComment(member.id, task.id, { text: "Hola" });

    await deleteComment(member.id, comment.id);
    const found = await db.comment.findUnique({ where: { id: comment.id } });
    expect(found).toBeNull();
  });

  it("rejects an editor deleting someone else's comment with FORBIDDEN", async () => {
    const { owner, member, task } = await createTaskWithMember("editor");
    const comment = await addComment(owner.id, task.id, { text: "Del propietario" });

    await expect(
      deleteComment(member.id, comment.id)
    ).rejects.toMatchObject({ code: "FORBIDDEN" } satisfies Partial<ApiError>);
  });

  it("lets an admin delete someone else's comment", async () => {
    const { owner, member, task } = await createTaskWithMember("admin");
    const comment = await addComment(owner.id, task.id, { text: "Del propietario" });

    await deleteComment(member.id, comment.id);
    const found = await db.comment.findUnique({ where: { id: comment.id } });
    expect(found).toBeNull();
  });
});
