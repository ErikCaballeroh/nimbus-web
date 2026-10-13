import { randomUUID } from "node:crypto";
import { afterAll, describe, expect, it } from "vitest";
import { db } from "@/lib/db";
import type { ApiError } from "@/lib/api";
import { createProject, deleteProject, updateProject } from "./service";

async function createUser() {
  return db.user.create({
    data: { name: "Test User", email: `test-${randomUUID()}@nimbus.test`, passwordHash: "x" },
  });
}

afterAll(async () => {
  await db.$disconnect();
});

describe("createProject", () => {
  it("inserts the creator as owner in the same transaction", async () => {
    const owner = await createUser();
    const project = await createProject(owner.id, { name: "Proyecto de prueba" });

    expect(project.myRole).toBe("owner");
    const membership = await db.projectMember.findUniqueOrThrow({
      where: { projectId_userId: { projectId: project.id, userId: owner.id } },
    });
    expect(membership.role).toBe("owner");
  });
});

describe("updateProject", () => {
  it("rejects a non-member with NOT_FOUND", async () => {
    const owner = await createUser();
    const outsider = await createUser();
    const project = await createProject(owner.id, { name: "Proyecto" });

    await expect(
      updateProject(outsider.id, project.id, { name: "Nuevo nombre" })
    ).rejects.toMatchObject({ code: "NOT_FOUND" } satisfies Partial<ApiError>);
  });

  it("rejects a viewer with FORBIDDEN", async () => {
    const owner = await createUser();
    const viewer = await createUser();
    const project = await createProject(owner.id, { name: "Proyecto" });
    await db.projectMember.create({ data: { projectId: project.id, userId: viewer.id, role: "viewer" } });

    await expect(
      updateProject(viewer.id, project.id, { name: "Nuevo nombre" })
    ).rejects.toMatchObject({ code: "FORBIDDEN" } satisfies Partial<ApiError>);
  });

  it("allows an admin to update", async () => {
    const owner = await createUser();
    const admin = await createUser();
    const project = await createProject(owner.id, { name: "Proyecto" });
    await db.projectMember.create({ data: { projectId: project.id, userId: admin.id, role: "admin" } });

    const updated = await updateProject(admin.id, project.id, { name: "Nuevo nombre" });
    expect(updated.name).toBe("Nuevo nombre");
  });
});

describe("deleteProject", () => {
  it("rejects a non-owner admin with FORBIDDEN", async () => {
    const owner = await createUser();
    const admin = await createUser();
    const project = await createProject(owner.id, { name: "Proyecto" });
    await db.projectMember.create({ data: { projectId: project.id, userId: admin.id, role: "admin" } });

    await expect(deleteProject(admin.id, project.id)).rejects.toMatchObject({ code: "FORBIDDEN" } satisfies Partial<ApiError>);
  });

  it("allows the owner to delete", async () => {
    const owner = await createUser();
    const project = await createProject(owner.id, { name: "Proyecto" });

    await deleteProject(owner.id, project.id);
    const found = await db.project.findUnique({ where: { id: project.id } });
    expect(found).toBeNull();
  });
});
