import { z } from "zod";
import { title, description, status, priority, dueDate } from "@/features/tasks/schemas";

/**
 * Validates an already-mapped row: Spanish enum labels from the file have
 * already been translated to codes, and `etiquetas` has already been split
 * into an array, before this schema runs (see parsers.ts#mapAndValidateRow).
 */
export const importRowSchema = z.object({
  title,
  description,
  status: status.optional(),
  priority: priority.optional(),
  assigneeEmail: z.preprocess(
    (v) => (typeof v === "string" ? v.trim().toLowerCase() : v),
    z.email({ error: "Correo de responsable no válido." })
  ).optional(),
  dueDate,
  tags: z.array(z.string().trim().min(1).max(60)).max(20).default([]),
});
export type ImportRowInput = z.infer<typeof importRowSchema>;

export const importFormatSchema = z.enum(["csv", "xlsx"], { error: "Formato no soportado." });
export type ImportExportFormat = z.infer<typeof importFormatSchema>;

export const exportQuerySchema = z.object({ format: importFormatSchema });
