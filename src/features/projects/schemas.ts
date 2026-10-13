import { z } from "zod";

const name = z.string().trim().min(3, { error: "El nombre debe tener al menos 3 caracteres." }).max(150);
const description = z.string().trim().max(2000).optional();
const color = z
  .string()
  .regex(/^#[0-9a-fA-F]{6}$/, { error: "Color no válido." })
  .optional();
const date = z.iso.date({ error: "Fecha no válida." }).optional();

export const createProjectSchema = z
  .object({ name, description, color, startDate: date, endDate: date })
  .refine((v) => !v.startDate || !v.endDate || v.endDate >= v.startDate, {
    error: "La fecha de entrega no puede ser anterior a la de inicio.",
    path: ["endDate"],
  });
export type CreateProjectInput = z.infer<typeof createProjectSchema>;

export const updateProjectSchema = z
  .object({ name: name.optional(), description, color, startDate: date, endDate: date })
  .refine((v) => !v.startDate || !v.endDate || v.endDate >= v.startDate, {
    error: "La fecha de entrega no puede ser anterior a la de inicio.",
    path: ["endDate"],
  });
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
