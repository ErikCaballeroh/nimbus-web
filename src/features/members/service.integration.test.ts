import { randomUUID } from "node:crypto";
import { afterAll, describe, expect, it } from "vitest";
import { db } from "@/lib/db";
import type { ApiError } from "@/lib/api";
import { createProject } from "@/features/projects/service";
import { addMember, changeMemberRole, removeMember } from "./service";

async function createUser() {
  return db.user.create({
    data: { name: "Test User", email: `test-${randomUUID()}@nimbus.test`, passwordHash: "x" },
  });
}

async function projectWithOwner() {
  const owner = await createUser();
  const project = await createProject(owner.id, { name: "Proyecto" });
  return { owner, project };
}

afterAll(async () => {
  await db.$disconnect();
});

describe("addMember", () => {
  it("rejects a viewer with FORBIDDEN", async () => {
    const { project } = await projectWithOwner();
    const viewer = await createUser();
    const target = await createUser();
    await db.projectMember.create({ data: { projectId: project.id, userId: viewer.id, role: "viewer" } });

    await expect(
      addMember(viewer.id, project.id, { userId: target.id, role: "editor" })
    ).rejects.toMatchObject({ code: "FORBIDDEN" } satisfies Partial<ApiError>);
  });

  it("rejects adding the same user twice with CONFLICT", async () => {
    const { owner, project } = await projectWithOwner();
    const target = await createUser();
    await addMember(owner.id, project.id, { userId: target.id, role: "editor" });

    await expect(
      addMember(owner.id, project.id, { userId: target.id, role: "viewer" })
    ).rejects.toMatchObject({ code: "CONFLICT" } satisfies Partial<ApiError>);
  });
});

describe("removeMember", () => {
  it("never allows removing the owner", async () => {
    const { owner, project } = await projectWithOwner();
    const admin = await createUser();
    await db.projectMember.create({ data: { projectId: project.id, userId: admin.id, role: "admin" } });

    await expect(removeMember(admin.id, project.id, owner.id)).rejects.toMatchObject({ code: "FORBIDDEN" } satisfies Partial<ApiError>);
  });

  it("rejects a non-member target with NOT_FOUND", async () => {
    const { owner, project } = await projectWithOwner();
    const outsider = await createUser();

    await expect(removeMember(owner.id, project.id, outsider.id)).rejects.toMatchObject({ code: "NOT_FOUND" } satisfies Partial<ApiError>);
  });

  it("lets an admin remove an editor", async () => {
    const { owner, project } = await projectWithOwner();
    const editor = await createUser();
    await db.projectMember.create({ data: { projectId: project.id, userId: editor.id, role: "editor" } });

    await removeMember(owner.id, project.id, editor.id);
    const found = await db.projectMember.findUnique({ where: { projectId_userId: { projectId: project.id, userId: editor.id } } });
    expect(found).toBeNull();
  });
});

describe("changeMemberRole", () => {
  it("rejects changing your own role", async () => {
    const { owner, project } = await projectWithOwner();

    await expect(changeMemberRole(owner.id, project.id, owner.id, "admin")).rejects.toMatchObject({
      code: "FORBIDDEN",
    } satisfies Partial<ApiError>);
  });

  it("rejects a non-owner granting the owner role", async () => {
    const { project } = await projectWithOwner();
    const admin = await createUser();
    const target = await createUser();
    await db.projectMember.create({ data: { projectId: project.id, userId: admin.id, role: "admin" } });
    await db.projectMember.create({ data: { projectId: project.id, userId: target.id, role: "editor" } });

    await expect(changeMemberRole(admin.id, project.id, target.id, "owner")).rejects.toMatchObject({
      code: "FORBIDDEN",
    } satisfies Partial<ApiError>);
  });

  it("rejects changing the current owner's role directly", async () => {
    const { owner, project } = await projectWithOwner();
    const admin = await createUser();
    await db.projectMember.create({ data: { projectId: project.id, userId: admin.id, role: "admin" } });

    await expect(changeMemberRole(admin.id, project.id, owner.id, "admin")).rejects.toMatchObject({
      code: "FORBIDDEN",
    } satisfies Partial<ApiError>);
  });

  it("transfers ownership and demotes the previous owner to admin, keeping exactly one owner", async () => {
    const { owner, project } = await projectWithOwner();
    const target = await createUser();
    await db.projectMember.create({ data: { projectId: project.id, userId: target.id, role: "editor" } });

    await changeMemberRole(owner.id, project.id, target.id, "owner");

    const members = await db.projectMember.findMany({ where: { projectId: project.id } });
    const owners = members.filter((m) => m.role === "owner");
    expect(owners).toHaveLength(1);
    expect(owners[0].userId).toBe(target.id);
    const previousOwner = members.find((m) => m.userId === owner.id);
    expect(previousOwner?.role).toBe("admin");
  });
});
