import { randomUUID } from "node:crypto";
import { afterAll, describe, expect, it } from "vitest";
import { db } from "@/lib/db";
import type { ApiError } from "@/lib/api";
import { createProject } from "@/features/projects/service";
import { parseCsv, rowsToCsv } from "./parsers";
import { previewImport, importTasks, exportTasks } from "./service";

async function createUser(email?: string) {
  return db.user.create({
    data: { name: "Test User", email: email ?? `test-${randomUUID()}@nimbus.test`, passwordHash: "x" },
  });
}

async function createProjectWithRole(role: "admin" | "editor" | "viewer") {
  const owner = await createUser();
  const member = await createUser();
  const project = await createProject(owner.id, { name: "Proyecto de prueba" });
  await db.projectMember.create({ data: { projectId: project.id, userId: member.id, role } });
  return { owner, member, project };
}

function csvFile(content: string, name = "tasks.csv") {
  return new File([content], name, { type: "text/csv" });
}

const HEADER = "titulo,descripcion,estado,prioridad,responsable,fecha_limite,etiquetas";

afterAll(async () => {
  await db.$disconnect();
});

describe("previewImport", () => {
  it("validates rows without writing anything", async () => {
    const { owner, project } = await createProjectWithRole("editor");
    const csv = `${HEADER}\nTarea válida,,Pendiente,Alta,,,`;

    const before = await db.task.count({ where: { projectId: project.id } });
    const result = await previewImport(owner.id, project.id, csvFile(csv));
    const after = await db.task.count({ where: { projectId: project.id } });

    expect(result.validCount).toBe(1);
    expect(result.invalidCount).toBe(0);
    expect(after).toBe(before);
  });

  it("reports a missing title as invalid", async () => {
    const { owner, project } = await createProjectWithRole("editor");
    const csv = `${HEADER}\n,,,,,,`;

    const result = await previewImport(owner.id, project.id, csvFile(csv));
    expect(result.invalidCount).toBe(1);
    expect(result.rows[0].errors?.join(" ")).toMatch(/título/i);
  });

  it("distinguishes an unknown email from a non-member email", async () => {
    const { owner, project } = await createProjectWithRole("editor");
    const outsider = await createUser();
    const csv = `${HEADER}\nSin cuenta,,,,no-existe-${randomUUID()}@nimbus.test,,\nNo es miembro,,,,${outsider.email},,`;

    const result = await previewImport(owner.id, project.id, csvFile(csv));
    expect(result.invalidCount).toBe(2);
    expect(result.rows[0].errors?.join(" ")).toMatch(/no tiene una cuenta/i);
    expect(result.rows[1].errors?.join(" ")).toMatch(/miembro del proyecto/i);
  });

  it("rejects a viewer with FORBIDDEN", async () => {
    const { member, project } = await createProjectWithRole("viewer");
    await expect(
      previewImport(member.id, project.id, csvFile(`${HEADER}\nTarea,,,,,,`))
    ).rejects.toMatchObject({ code: "FORBIDDEN" } satisfies Partial<ApiError>);
  });

  it("rejects a non-member with NOT_FOUND", async () => {
    const outsider = await createUser();
    const owner = await createUser();
    const project = await createProject(owner.id, { name: "Proyecto" });

    await expect(
      previewImport(outsider.id, project.id, csvFile(`${HEADER}\nTarea,,,,,,`))
    ).rejects.toMatchObject({ code: "NOT_FOUND" } satisfies Partial<ApiError>);
  });

  it("rejects an unsupported file extension", async () => {
    const { owner, project } = await createProjectWithRole("editor");
    const file = new File(["not a spreadsheet"], "tasks.txt", { type: "text/plain" });
    await expect(previewImport(owner.id, project.id, file)).rejects.toMatchObject({
      code: "VALIDATION_ERROR",
    } satisfies Partial<ApiError>);
  });
});

describe("importTasks", () => {
  it("imports valid rows, creates tags on the fly, and skips invalid ones", async () => {
    const { owner, member, project } = await createProjectWithRole("editor");
    const csv =
      `${HEADER}\n` +
      `Tarea válida,Detalle,Pendiente,Alta,${member.email},2026-01-15,"backend,nuevo"\n` +
      `,,,,,,`;

    const result = await importTasks(owner.id, project.id, csvFile(csv));

    expect(result.imported).toBe(1);
    expect(result.skipped).toBe(1);
    expect(result.errors).toHaveLength(1);

    const tasks = await db.task.findMany({ where: { projectId: project.id }, include: { tags: { include: { tag: true } } } });
    expect(tasks).toHaveLength(1);
    expect(tasks[0].title).toBe("Tarea válida");
    expect(tasks[0].assigneeId).toBe(member.id);
    expect(tasks[0].tags.map((t) => t.tag.name).sort()).toEqual(["backend", "nuevo"]);

    const notification = await db.notification.findFirst({ where: { recipientId: member.id, type: "assigned" } });
    expect(notification).not.toBeNull();
  });

  it("keeps separate task_seq sequences correctly under a batch import", async () => {
    const { owner, project } = await createProjectWithRole("editor");
    const csv = `${HEADER}\nUno,,,,,,\nDos,,,,,,\nTres,,,,,,`;

    const result = await importTasks(owner.id, project.id, csvFile(csv));
    expect(result.imported).toBe(3);

    const dbProject = await db.project.findUniqueOrThrow({ where: { id: project.id } });
    const tasks = await db.task.findMany({ where: { projectId: project.id }, orderBy: { code: "asc" } });
    expect(tasks.map((t) => t.code)).toEqual([
      `${dbProject.codePrefix}-1`,
      `${dbProject.codePrefix}-2`,
      `${dbProject.codePrefix}-3`,
    ]);
  });

  it("rejects a viewer with FORBIDDEN", async () => {
    const { member, project } = await createProjectWithRole("viewer");
    await expect(
      importTasks(member.id, project.id, csvFile(`${HEADER}\nTarea,,,,,,`))
    ).rejects.toMatchObject({ code: "FORBIDDEN" } satisfies Partial<ApiError>);
  });
});

describe("exportTasks round-trip", () => {
  it("exports a project's tasks and re-imports them unchanged into another project", async () => {
    const owner = await createUser();
    const assignee = await createUser();
    const source = await createProject(owner.id, { name: "Origen" });
    await db.projectMember.create({ data: { projectId: source.id, userId: assignee.id, role: "editor" } });

    const seedCsv =
      `${HEADER}\n` +
      `Con responsable,Desc A,En progreso,Alta,${assignee.email},2026-03-01,"a,b"\n` +
      `Sin responsable,Desc B,Completado,Baja,,,`;
    await importTasks(owner.id, source.id, csvFile(seedCsv));

    const { tasks, assigneeEmails, format } = await exportTasks(owner.id, source.id, "csv");
    expect(format).toBe("csv");
    const csv = rowsToCsv(tasks, assigneeEmails);
    const parsedBack = parseCsv(csv);
    expect(parsedBack).toHaveLength(2);

    const target = await createProject(owner.id, { name: "Destino" });
    await db.projectMember.create({ data: { projectId: target.id, userId: assignee.id, role: "editor" } });

    const result = await importTasks(owner.id, target.id, csvFile(csv));
    expect(result.imported).toBe(2);
    expect(result.skipped).toBe(0);

    const targetTasks = await db.task.findMany({ where: { projectId: target.id }, orderBy: { title: "asc" } });
    const sourceTasks = await db.task.findMany({ where: { projectId: source.id }, orderBy: { title: "asc" } });
    expect(targetTasks.map((t) => ({ title: t.title, status: t.status, priority: t.priority, assigneeId: t.assigneeId }))).toEqual(
      sourceTasks.map((t) => ({ title: t.title, status: t.status, priority: t.priority, assigneeId: t.assigneeId }))
    );
  });
});
