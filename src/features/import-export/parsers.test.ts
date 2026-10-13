import { describe, expect, it } from "vitest";
import ExcelJS from "exceljs";
import type { Task } from "@/features/tasks/types";
import { parseCsv, parseXlsx, mapAndValidateRow, rowsToCsv, rowsToXlsx } from "./parsers";
import { COLUMNS } from "./columns";

const HEADER = COLUMNS.join(",");

describe("parseCsv", () => {
  it("parses a well-formed row for every column", () => {
    const csv = `${HEADER}\nConfigurar CI,Agregar pipeline,Pendiente,Alta,ana@nimbus.test,2026-01-15,"backend,infra"`;
    const rows = parseCsv(csv);
    expect(rows).toEqual([
      {
        titulo: "Configurar CI",
        descripcion: "Agregar pipeline",
        estado: "Pendiente",
        prioridad: "Alta",
        responsable: "ana@nimbus.test",
        fecha_limite: "2026-01-15",
        etiquetas: "backend,infra",
      },
    ]);
  });

  it("fills missing optional columns with empty strings", () => {
    const csv = `${HEADER}\nSolo título,,,,,,`;
    const [row] = parseCsv(csv);
    expect(row.titulo).toBe("Solo título");
    expect(row.descripcion).toBe("");
    expect(row.responsable).toBe("");
  });
});

describe("parseXlsx", () => {
  async function buildWorkbookBuffer(rows: string[][]) {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Tareas");
    sheet.addRow([...COLUMNS]);
    for (const row of rows) sheet.addRow(row);
    return workbook.xlsx.writeBuffer();
  }

  it("maps columns by header text, not position", async () => {
    // Headers deliberately reordered — assignment by text must still work.
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Tareas");
    sheet.addRow(["titulo", "estado", "descripcion", "prioridad", "responsable", "fecha_limite", "etiquetas"]);
    sheet.addRow(["Revisar PR", "En progreso", "Code review", "Media", "", "", "qa"]);
    const buffer = await workbook.xlsx.writeBuffer();

    const rows = await parseXlsx(buffer as unknown as ArrayBuffer);
    expect(rows).toEqual([
      {
        titulo: "Revisar PR",
        descripcion: "Code review",
        estado: "En progreso",
        prioridad: "Media",
        responsable: "",
        fecha_limite: "",
        etiquetas: "qa",
      },
    ]);
  });

  it("parses a valid row", async () => {
    const buffer = await buildWorkbookBuffer([
      ["Tarea válida", "", "Pendiente", "Baja", "", "", ""],
    ]);
    const rows = await parseXlsx(buffer as unknown as ArrayBuffer);
    expect(rows[0].titulo).toBe("Tarea válida");
    expect(rows[0].estado).toBe("Pendiente");
  });
});

describe("mapAndValidateRow", () => {
  it("accepts a fully valid row", () => {
    const result = mapAndValidateRow(
      {
        titulo: "Tarea completa",
        descripcion: "Detalle",
        estado: "Pendiente",
        prioridad: "Alta",
        responsable: "ana@nimbus.test",
        fecha_limite: "2026-01-15",
        etiquetas: "backend, infra",
      },
      2
    );
    expect(result.valid).toBe(true);
    expect(result.data).toMatchObject({
      title: "Tarea completa",
      status: "todo",
      priority: "high",
      assigneeEmail: "ana@nimbus.test",
      tags: ["backend", "infra"],
    });
  });

  it("rejects a missing title", () => {
    const result = mapAndValidateRow(
      { titulo: "", descripcion: "", estado: "", prioridad: "", responsable: "", fecha_limite: "", etiquetas: "" },
      3
    );
    expect(result.valid).toBe(false);
    expect(result.errors?.join(" ")).toMatch(/título/i);
  });

  it("rejects a malformed due date", () => {
    const result = mapAndValidateRow(
      {
        titulo: "Tarea",
        descripcion: "",
        estado: "",
        prioridad: "",
        responsable: "",
        fecha_limite: "31/12/2025",
        etiquetas: "",
      },
      4
    );
    expect(result.valid).toBe(false);
    expect(result.errors?.join(" ")).toMatch(/fecha/i);
  });

  it("rejects an unrecognized estado value", () => {
    const result = mapAndValidateRow(
      {
        titulo: "Tarea",
        descripcion: "",
        estado: "Archivado",
        prioridad: "",
        responsable: "",
        fecha_limite: "",
        etiquetas: "",
      },
      5
    );
    expect(result.valid).toBe(false);
    expect(result.errors?.join(" ")).toMatch(/estado/i);
  });

  it("rejects a malformed assignee email", () => {
    const result = mapAndValidateRow(
      {
        titulo: "Tarea",
        descripcion: "",
        estado: "",
        prioridad: "",
        responsable: "no-es-un-correo",
        fecha_limite: "",
        etiquetas: "",
      },
      6
    );
    expect(result.valid).toBe(false);
  });
});

describe("rowsToCsv / rowsToXlsx", () => {
  const task: Task = {
    id: "t1",
    code: "NIM-1",
    title: "Tarea exportada",
    description: "Detalle",
    status: "done",
    priority: "urgent",
    assigneeId: "u1",
    assignee: { id: "u1", name: "Ana", avatarColor: "#000" },
    dueDate: "2026-02-01T00:00:00.000Z",
    projectId: "p1",
    tags: [{ id: "tag1", name: "backend", color: null }],
    commentCount: 0,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  };
  const assigneeEmails = { u1: "ana@nimbus.test" };

  it("round-trips status/priority labels through rowsToCsv and back", () => {
    const csv = rowsToCsv([task], assigneeEmails);
    const [row] = parseCsv(csv);
    expect(row.estado).toBe("Completado");
    expect(row.prioridad).toBe("Urgente");
    expect(row.responsable).toBe("ana@nimbus.test");
    expect(row.etiquetas).toBe("backend");

    const mapped = mapAndValidateRow(row, 2);
    expect(mapped.valid).toBe(true);
    expect(mapped.data?.status).toBe("done");
    expect(mapped.data?.priority).toBe("urgent");
  });

  it("round-trips through rowsToXlsx and back", async () => {
    const buffer = await rowsToXlsx([task], assigneeEmails);
    const rows = await parseXlsx(buffer as unknown as ArrayBuffer);
    expect(rows[0].estado).toBe("Completado");
    expect(rows[0].prioridad).toBe("Urgente");
  });
});
