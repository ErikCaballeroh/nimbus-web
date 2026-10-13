import { es } from "@/lib/i18n/es";
import type { Priority, Status } from "@/features/tasks/types";

/**
 * Single source of truth for the import/export file contract: Spanish
 * headers in the file, English keys in code. Order matters — it's the
 * column order written on export and the order shown in the template.
 */
export const COLUMNS = [
  "titulo",
  "descripcion",
  "estado",
  "prioridad",
  "responsable",
  "fecha_limite",
  "etiquetas",
] as const;

export type ColumnKey = (typeof COLUMNS)[number];

export const COLUMN_HEADERS: Record<ColumnKey, string> = {
  titulo: "titulo",
  descripcion: "descripcion",
  estado: "estado",
  prioridad: "prioridad",
  responsable: "responsable",
  fecha_limite: "fecha_limite",
  etiquetas: "etiquetas",
};

// Inverted from lib/i18n/es.ts so the Spanish-label <-> enum-code mapping
// always matches what the UI actually shows, not a separately maintained list.
export const STATUS_LABEL_TO_CODE: Record<string, Status> = Object.fromEntries(
  Object.entries(es.enums.status).map(([code, label]) => [label, code as Status])
);

export const PRIORITY_LABEL_TO_CODE: Record<string, Priority> = Object.fromEntries(
  Object.entries(es.enums.priority).map(([code, label]) => [label, code as Priority])
);
