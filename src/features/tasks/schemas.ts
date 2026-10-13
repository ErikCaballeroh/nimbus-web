import { z } from "zod";

const title = z.string().trim().min(3, { error: "El título debe tener al menos 3 caracteres." }).max(200);
const description = z.string().trim().max(5000).optional();
const status = z.enum(["todo", "in_progress", "review", "done"], { error: "Estado no válido." });
const priority = z.enum(["low", "medium", "high", "urgent"], { error: "Prioridad no válida." });
const assigneeId = z.uuid({ error: "Responsable no válido." }).nullable().optional();
const dueDate = z.iso.date({ error: "Fecha no válida." }).nullable().optional();

export const createTaskSchema = z.object({
  title,
  description,
  status: status.optional(),
  priority: priority.optional(),
  assigneeId,
  dueDate,
});
export type CreateTaskInput = z.infer<typeof createTaskSchema>;

export const updateTaskSchema = z.object({
  title: title.optional(),
  description,
  priority: priority.optional(),
  assigneeId,
  dueDate,
});
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;

export const updateTaskStatusSchema = z.object({ status });
export type UpdateTaskStatusInput = z.infer<typeof updateTaskStatusSchema>;

export const taskFiltersSchema = z.object({
  status: status.optional(),
  assignee: z.uuid({ error: "Responsable no válido." }).optional(),
  priority: priority.optional(),
});
export type TaskFilters = z.infer<typeof taskFiltersSchema>;

export const setTaskTagsSchema = z.object({
  tagIds: z.array(z.uuid({ error: "Etiqueta no válida." })).max(20),
});
export type SetTaskTagsInput = z.infer<typeof setTaskTagsSchema>;
