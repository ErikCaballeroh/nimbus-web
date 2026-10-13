import Papa from "papaparse";
import ExcelJS from "exceljs";
import { es } from "@/lib/i18n/es";
import type { Task } from "@/features/tasks/types";
import { COLUMNS, COLUMN_HEADERS, STATUS_LABEL_TO_CODE, PRIORITY_LABEL_TO_CODE, type ColumnKey } from "./columns";
import { importRowSchema, type ImportRowInput } from "./schemas";

export const MAX_IMPORT_FILE_BYTES = 5 * 1024 * 1024;
export const MAX_IMPORT_ROWS = 1000;

export type RawRow = Record<ColumnKey, string>;

export interface RowResult {
  row: number;
  valid: boolean;
  data?: ImportRowInput;
  errors?: string[];
}

function emptyRawRow(): RawRow {
  return { titulo: "", descripcion: "", estado: "", prioridad: "", responsable: "", fecha_limite: "", etiquetas: "" };
}

export function parseCsv(text: string): RawRow[] {
  const result = Papa.parse<Record<string, string>>(text, { header: true, skipEmptyLines: true });
  return result.data.map((record) => {
    const row = emptyRawRow();
    for (const key of COLUMNS) row[key] = (record[key] ?? "").toString().trim();
    return row;
  });
}

export async function parseXlsx(buffer: ArrayBuffer): Promise<RawRow[]> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);
  const sheet = workbook.worksheets[0];
  if (!sheet) return [];

  const headerRow = sheet.getRow(1);
  const columnByIndex: Record<number, ColumnKey> = {};
  headerRow.eachCell((cell, colNumber) => {
    const text = cell.value?.toString().trim();
    const match = COLUMNS.find((key) => COLUMN_HEADERS[key] === text);
    if (match) columnByIndex[colNumber] = match;
  });

  const rows: RawRow[] = [];
  for (let i = 2; i <= sheet.rowCount; i++) {
    const sheetRow = sheet.getRow(i);
    if (sheetRow.cellCount === 0) continue;
    const row = emptyRawRow();
    sheetRow.eachCell({ includeEmpty: false }, (cell, colNumber) => {
      const key = columnByIndex[colNumber];
      if (!key) return;
      const value = cell.value;
      row[key] = value instanceof Date ? value.toISOString().slice(0, 10) : (value?.toString().trim() ?? "");
    });
    rows.push(row);
  }
  return rows;
}

/**
 * Pure, synchronous, no DB: translates Spanish enum labels and the
 * comma-separated tag list, then runs the shape/business-rule schema.
 * Does not check that `responsable` resolves to a real project member —
 * that needs a DB round-trip (see service.ts#resolveAssignee).
 */
export function mapAndValidateRow(raw: RawRow, rowNumber: number): RowResult {
  const errors: string[] = [];

  let status: ImportRowInput["status"];
  if (raw.estado) {
    status = STATUS_LABEL_TO_CODE[raw.estado];
    if (!status) errors.push("Estado no válido. Usa: Pendiente, En progreso, Revisión o Completado.");
  }

  let priority: ImportRowInput["priority"];
  if (raw.prioridad) {
    priority = PRIORITY_LABEL_TO_CODE[raw.prioridad];
    if (!priority) errors.push("Prioridad no válida. Usa: Baja, Media, Alta o Urgente.");
  }

  const tags = raw.etiquetas
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  const result = importRowSchema.safeParse({
    title: raw.titulo,
    description: raw.descripcion || undefined,
    status,
    priority,
    assigneeEmail: raw.responsable || undefined,
    dueDate: raw.fecha_limite || undefined,
    tags,
  });

  if (!result.success) {
    for (const issue of result.error.issues) errors.push(issue.message);
  }

  if (errors.length > 0) return { row: rowNumber, valid: false, errors };
  return { row: rowNumber, valid: true, data: result.success ? result.data : undefined };
}

export function rowsToCsv(tasks: Task[], assigneeEmails: Record<string, string>): string {
  const rows = tasks.map((task) => taskToRecord(task, assigneeEmails));
  return Papa.unparse({ fields: COLUMNS.map((key) => COLUMN_HEADERS[key]), data: rows.map((r) => COLUMNS.map((key) => r[key])) });
}

export async function rowsToXlsx(tasks: Task[], assigneeEmails: Record<string, string>): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Tareas");
  sheet.addRow(COLUMNS.map((key) => COLUMN_HEADERS[key]));
  for (const task of tasks) {
    const record = taskToRecord(task, assigneeEmails);
    sheet.addRow(COLUMNS.map((key) => record[key]));
  }
  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}

function taskToRecord(task: Task, assigneeEmails: Record<string, string>): RawRow {
  return {
    titulo: task.title,
    descripcion: task.description,
    estado: es.enums.status[task.status],
    prioridad: es.enums.priority[task.priority],
    responsable: task.assigneeId ? (assigneeEmails[task.assigneeId] ?? "") : "",
    fecha_limite: task.dueDate ? task.dueDate.slice(0, 10) : "",
    etiquetas: task.tags.map((t) => t.name).join(","),
  };
}
